# Kiến trúc Xóm Oii (đề xuất v1)

> Trạng thái: đã review sau M0. Các quyết định nằm ở [mục 9](#9-quyết-định-đã-chốt-review-m0).

## 1. Tổng quan

```mermaid
flowchart LR
  subgraph Client["Trình duyệt (apps/web)"]
    UI["React UI + Tailwind<br/>copy/vi.ts"]
    R3F["three.js / R3F<br/>Oii Street"]
    COL_C["colyseus.js"]
    LK_C["livekit-client<br/>(lazy-load)"]
  end

  subgraph Server["Node 20 · 1 process (apps/server)"]
    API["Fastify<br/>auth · seat · voice token · quest · admin"]
    ROOMS["Colyseus<br/>StreetRoom × N instance"]
    VOICE["VoiceDirector<br/>2 Hz updateSubscriptions"]
  end

  BOT["OiiMate bot<br/>(Messenger)"]
  PG[("Postgres<br/>Prisma")]
  RD[("Redis<br/>token · session · rate limit")]
  LK["LiveKit SFU"]
  R2[("Cloudflare R2<br/>ảnh quest / bằng chứng")]
  MAIL["Resend<br/>OTP"]

  UI -- HTTPS cookie --> API
  COL_C -- WebSocket --> ROOMS
  LK_C -- WebRTC audio --> LK
  BOT -- "POST /internal/magic-link<br/>(shared secret)" --> API
  API --> PG
  API --> RD
  ROOMS --> RD
  ROOMS -- ChatLog, Report --> PG
  VOICE -- RoomService API --> LK
  ROOMS -. vị trí .-> VOICE
  API -- presigned PUT --> R2
  API --> MAIL
```

**Nguyên tắc xuyên suốt**

1. **Server là nguồn sự thật**: vị trí, tốc độ, bus, NPC, ai nhận được tin chat nào, ai nghe được ai.
2. **Client chỉ nhận cái nó được phép biết**: text chat của người ở xa không bao giờ rời server; track voice của người ở xa không bao giờ được subscribe.
3. **Dữ liệu thế giới dùng chung**: `packages/world` (collider, seats, spots) chạy y hệt ở client (dự đoán) và server (validate).
4. **Mọi payload vào server đi qua zod** trong `packages/shared`.
5. **Ẩn danh**: không có tên thật; email/psid chỉ là hash (SHA-256 + pepper).

## 2. Các package

| Package           | Vai trò                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared` | Hằng số (`CLEAR_RADIUS`, `HEAR_RADIUS`, rate limit, giờ mở…), zod schema client→server, hàm thuần: giờ mở cửa theo London, `distanceBand`, `voiceGain`, sanitize text. |
| `packages/world`  | Hệ toạ độ phố, AABB collider, seats, spots, layout Oii Street, `resolveCollisions` tất định.                                                                           |
| `apps/server`     | Fastify (HTTP) + Colyseus (WebSocket) trên **cùng một HTTP server**. Bundle bằng tsup.                                                                                 |
| `apps/web`        | Vite + React 18 + R3F. Admin là route `/admin` lazy-load trong web (không tách app riêng ở v1).                                                                        |
| `prisma/`         | Schema Postgres (brief §6), migrations.                                                                                                                                |

Package nội bộ xuất thẳng TypeScript nguồn (`exports: ./src/index.ts`): Vite và tsx đọc trực tiếp, tsup bundle vào khi build server. Không cần bước build riêng cho package.

## 3. Luồng auth

### 3.1 Magic link từ OiiMate bot (luồng chính)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant B as OiiMate bot
  participant A as API (Fastify)
  participant R as Redis
  participant DB as Postgres
  participant W as Web

  U->>B: /xom
  B->>A: POST /internal/magic-link {psidHash, tier}<br/>Header: X-Oii-Signature = HMAC(secret, ts+body)
  A->>A: kiểm chữ ký + timestamp (±60s, chống replay)
  A->>R: SET ml:{sha256(token)} = {psidHash, tier} EX 300
  A-->>B: {url: https://xom.oiimate.app/enter?t=token}
  B-->>U: gửi link
  U->>W: mở /enter?t=token
  W->>A: POST /auth/magic/consume {t}
  A->>R: GETDEL ml:{sha256(t)} (dùng 1 lần)
  A->>DB: upsert User theo psidHash (lần đầu: chọn nickname/màu áo)
  A->>R: SET sess:{sid} = {userId} EX 14 ngày
  A-->>W: Set-Cookie xom_sid (httpOnly, Secure, SameSite=Lax)
  W->>W: history.replaceState xoá ?t khỏi URL
```

- Token 32 byte ngẫu nhiên, chỉ lưu **hash** trong Redis, TTL 5 phút, `GETDEL` để đảm bảo dùng một lần.
- Bot ký request bằng HMAC thay vì gửi secret trần, kèm timestamp để chặn replay.
- Session lưu ở Redis (không phải JWT) để **ban có hiệu lực ngay**: ban → xoá mọi `sess:*` của user + kick khỏi room.

### 3.2 OTP `.ac.uk` (dự phòng)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web
  participant A as API
  participant R as Redis
  participant M as Resend

  U->>W: nhập email .ac.uk
  W->>A: POST /auth/otp/request {email}
  A->>A: zod AcUkEmailSchema · rate limit theo IP + emailHash
  A->>R: SET otp:{emailHash} = {codeHash, attempts:0} EX 600
  A->>M: gửi mã 6 số (dev: in ra console)
  U->>W: nhập mã
  W->>A: POST /auth/otp/verify {email, code}
  A->>R: so sánh hằng thời gian · attempts++ · quá 5 lần → xoá
  A-->>W: Set-Cookie xom_sid (như trên)
```

Email **không bao giờ** được ghi xuống Postgres; chỉ `emailHash = sha256(pepper + lower(email))` để chống tạo trùng tài khoản.

### 3.3 Mã mời, mã alumni, hạng

```mermaid
flowchart TD
  S["student đã verify<br/>(2 mã OII-XXXX-XXXX)"] -->|invite code| P["professional<br/>probation 14 ngày<br/>invitedById = student"]
  G["Giveaway OiiMate<br/>ALUM-CAMPAIGN-XXXX<br/>hết hạn 7 ngày"] --> AP["Nộp AlumniProof<br/>email · document · voucher"]
  AP -->|admin duyệt| AL["alumni<br/>probation 14 ngày<br/>KHÔNG liên đới"]
  S & P & AL -->|"≥3 cuối tuần, 0 report xác nhận<br/>(job hằng tuần)"| T["cờ trustedAt<br/>voice ngay, giữ hạng gốc"]
```

- Dùng mã: transaction `UPDATE InviteCode SET usedById=… WHERE code=… AND usedAt IS NULL AND (expiresAt IS NULL OR expiresAt > now())` để tránh race dùng 2 lần.
- **Ban liên đới**: `banUser(userId)` trong một transaction: đặt `bannedAt`, nếu user có `invitedById` và mã là `kind=invite` thì ban luôn inviter (`banReason = "liên đới: <invitee>"`), ghi `AuditLog` cho từng người, sau đó thu hồi session + kick khỏi room. Admin panel hiện **cây invite** trước khi xác nhận.

## 4. Realtime (Colyseus)

### 4.1 Vào phố và chọn instance

```mermaid
sequenceDiagram
  autonumber
  participant W as Web
  participant A as API
  participant MM as Colyseus matchMaker
  participant RM as StreetRoom

  W->>A: POST /street/seat (cookie)
  A->>A: session hợp lệ? chưa ban? phố đang mở (hoặc OPEN_OVERRIDE)?
  A->>MM: query({name:"street"})
  A->>A: chọn room đông nhất mà còn < 40 người, không có thì tạo mới
  A->>MM: reserveSeatFor(room, {userId, tier, avatar})
  A-->>W: seat reservation
  W->>RM: consumeSeatReservation (WebSocket)
  RM->>RM: onJoin: spawn ở bến bus, nạp danh sách block của user
```

Ghép vào instance "gần đầy" trước để phố không loãng (brief §11). Việc kiểm tra auth/giờ mở/ban nằm ở một chỗ duy nhất (`/street/seat`), Colyseus chỉ nhận người có seat reservation hợp lệ.

### 4.2 StreetRoom

- **Tick mô phỏng 20 Hz**, `patchRate = 100 ms` (snapshot 10 Hz). Client gửi input 15 Hz và nội suy snapshot.
- **State** (`@colyseus/schema`): `players` (x, z, ry, pose, gesture, seatId, holding), `bus` (x, phase, doorsOpen), `npcs` (Dave, bồ câu), `clock` (giờ London cho ánh sáng, sự kiện giờ chung).
- **Validate input** cho mỗi `InputMessage`:
  1. zod parse; 2. `dist / dt ≤ MAX_SPEED × tolerance`, sai thì snap về vị trí server; 3. `resolveCollisions` bằng cùng collider với client; 4. đang ngồi/trên bus thì bỏ qua di chuyển.
- **"Đang gõ…"**: field `typing` gắn `@view(NEAR)`. Mỗi tick, với từng client, server thêm/bớt tag `NEAR` (qua `StateView`) cho người chơi khác trong `HEAR_RADIUS`, nên chỉ người đủ gần mới thấy.
- **Bus N29**: máy trạng thái trên server (`approaching → stopped 14s → departing → offscreen 10–18s`). Lên bus khi `stopped`, xuống ở lần `stopped` kế tiếp; người trên bus có vị trí gắn với bus.

### 4.3 Chat chữ theo khoảng cách

```mermaid
flowchart TD
  IN["client gửi 'chat' {text}"] --> Z{"zod OK?"}
  Z -- không --> DROP["bỏ"]
  Z -- có --> RL{"rate limit<br/>1/s · 20/phút<br/>(Redis, fallback bộ nhớ)"}
  RL -- vượt --> WARN["gửi 'chat:limited'"]
  RL -- ok --> SAN["sanitizeUserText<br/>(NFC, bỏ control/zero-width, ≤120)"]
  SAN --> F{"có link / từ cấm?"}
  F -- có --> REJ["gửi 'chat:rejected' cho người gửi"]
  F -- không --> LOG["ChatLog (async, giữ 14 ngày)"]
  LOG --> FAN["với từng client trong room"]
  FAN --> BL{"block hai chiều?"}
  BL -- có --> SKIP["không gửi gì"]
  BL -- không --> D{"distanceBand"}
  D -- clear --> C["'chat' {from, text, band:'clear'}"]
  D -- far --> FA["'chat' {from, text, band:'far'}"]
  D -- out --> MU["'murmur' {from} · không nội dung"]
```

Chat **không** nằm trong state (state thì ai cũng nhận). Server dùng `client.send` riêng cho từng người, nên client ở xa không bao giờ nhận được text.

## 5. Voice (LiveKit)

```mermaid
sequenceDiagram
  autonumber
  participant W as Web
  participant A as API
  participant LK as LiveKit
  participant RM as StreetRoom
  participant VD as VoiceDirector

  W->>A: POST /voice/token (cookie)
  A->>A: canUseVoice(user)? (trusted hoặc hết probation, chưa ban)
  A-->>W: JWT {room: instanceId, identity: userId,<br/>canPublish: true, canPublishSources:[microphone],<br/>canSubscribe: true, canPublishData: false}
  W->>LK: connect(autoSubscribe: false)
  W->>LK: publish mic (push-to-talk = mute/unmute track)
  loop 2 lần/giây
    RM-->>VD: vị trí mọi người + danh sách block
    VD->>VD: tính cặp trong HEAR_RADIUS, trừ cặp block<br/>diff với lần trước
    VD->>LK: updateSubscriptions(room, identity, trackSids, subscribe true/false)
  end
  LK-->>W: chỉ những track được server bật
  W->>W: mỗi track → MediaStreamSource → GainNode (voiceGain) → PannerNode HRTF
```

- Client **không có quyền tự subscribe**: token không thể làm gì hơn ngoài những track server đã bật cho nó, nên không nghe lén được người ở xa.
- `VoiceDirector` chỉ gửi **thay đổi** (diff) để giảm số lần gọi API. 40 người × 2 Hz vẫn nằm trong giới hạn.
- Âm thanh không gian ở client: vị trí panner cập nhật theo avatar mỗi frame; gain giảm tuyến tính từ 1 (≤ 4.5 m) xuống 0 (9 m) bằng `voiceGain` dùng chung.
- `livekit-client` được **lazy-load** khi user bật voice, để giữ bundle khởi động < 600 KB gzip.
- Report voice chỉ lưu metadata (ai, lúc nào, instance). **Không ghi âm.**

## 6. Dữ liệu và lưu trữ

| Nơi      | Dữ liệu                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Postgres | User, InviteCode, AlumniProof, Block, Report, ChatLog (14 ngày), Quest, QuestSubmission, Stamp, AuditLog                                |
| Redis    | `ml:*` magic-link (5 phút), `otp:*` (10 phút), `sess:*` (14 ngày), `rl:chat:*`, cờ override giờ mở                                      |
| R2       | Ảnh quest, ảnh bằng chứng alumni. Upload bằng presigned PUT, chỉ admin đọc qua presigned GET. Ảnh bằng chứng bị xoá sau khi duyệt xong. |

Job định kỳ (chạy trong cùng process ở v1, dùng khoá Redis để chỉ một instance chạy): xoá ChatLog > 14 ngày, nâng `trusted`, dọn mã hết hạn.

## 7. Bảo mật

- Cookie `xom_sid`: httpOnly, Secure, SameSite=Lax, domain `xom.oiimate.app`. Web và API chung site (ví dụ `xom.oiimate.app` và `api.xom.oiimate.app`) để cookie đi kèm cả request HTTP lẫn WebSocket.
- Các request thay đổi dữ liệu phải có header `X-Requested-With` và kiểm `Origin` để chống CSRF.
- Text người dùng chỉ render bằng `textContent` / JSX text. ESLint chặn `innerHTML` và `dangerouslySetInnerHTML` trong `apps/web`.
- Endpoint `/internal/*` chỉ nhận request có HMAC hợp lệ; `/admin/*` yêu cầu `role = admin`, mọi hành động đều ghi AuditLog.

## 8. Triển khai

```mermaid
flowchart LR
  CF["Cloudflare Pages<br/>xom.oiimate.app<br/>(apps/web dist)"] -->|HTTPS + WSS| FLY["Fly.io · lhr<br/>api.xom.oiimate.app<br/>(apps/server)"]
  FLY --> NEON[("Postgres managed")]
  FLY --> UP[("Upstash Redis")]
  FLY --> LKC["LiveKit Cloud"]
  FLY --> R2[("R2")]
```

- v1 chạy **một process** (Fastify + Colyseus). Đủ cho vài trăm người đồng thời (nhiều instance 40 người trong một process).
- Khi cần scale ngang: bật `RedisPresence` + `RedisDriver` của Colyseus, chạy nhiều máy Fly sau load balancer có sticky session; `/street/seat` vẫn chọn instance qua matchMaker dùng chung.
- Chi tiết sẽ ở `docs/DEPLOY.md` (M5).

## 9. Quyết định đã chốt (review M0)

1. **Ban liên đới một cấp**: chỉ ban inviter trực tiếp, không đệ quy.
2. **`trusted` là cờ** (`trustedAt`), không phải hạng. `Tier` = `student | alumni | professional`.
3. **Domain**: production `xom.oiimate.app` + `api.xom.oiimate.app`. Giai đoạn đầu: staging tạm trên `duychinhdinh.com`.
4. **Từ cấm**: team OiiMate cung cấp danh sách, đặt ở `packages/shared/src/wordlist/`.
5. **Bot**: team bot thêm lệnh `/xom` và ký HMAC theo §3.1.
