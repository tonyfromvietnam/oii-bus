# Xóm Oii

> Thích ở một mình nhưng thỉnh thoảng sợ cô đơn.

Phần tiếp theo của OiiMate: lên **Bus Oii**, chiếc bus siêu to chạy vòng quanh UK qua 28 địa danh. Tầng thượng tìm người cùng thành phố và rủ nhau đi chơi; tầng giữa là thư viện lofi; tầng dưới cùng là Chùa Cầu Duyên (thắp hương, tích phúc đức, xin quẻ se duyên 1:1). Nhân vật chibi dễ thương, điều khiển đơn giản, có nhiệm vụ tuần và hộ chiếu tem. Mở từ Thứ 6 19:00 tới hết Chủ nhật (giờ London).

Thiết kế thế giới: [`docs/WORLD.md`](docs/WORLD.md).

Kiến trúc: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Triển khai: [`docs/DEPLOY.md`](docs/DEPLOY.md) · Moderation: [`docs/MODERATION.md`](docs/MODERATION.md)

## Chạy local

Yêu cầu: Node ≥ 20, pnpm 9 (`corepack enable`), Docker (tuỳ chọn nhưng nên có).

```bash
pnpm install
pnpm dev
```

`pnpm dev` sẽ:

1. tạo `.env` từ `.env.example` nếu chưa có;
2. `docker compose up -d --wait` cho postgres, redis, livekit (bỏ qua nếu không có Docker, hoặc dùng `pnpm dev --no-infra`);
3. chạy web (http://localhost:5173) và server (http://localhost:2567) ở chế độ watch.

Muốn xem phố ngoài giờ mở cửa: đặt `OPEN_OVERRIDE=true` trong `.env`, hoặc mở `http://localhost:5173/?preview`.

### Prototype tĩnh (không cần server)

```bash
pnpm --filter @xom-oii/web build:standalone
```

Ra một file duy nhất `apps/web/dist-standalone/index.html`, vào thẳng Bus Oii offline. Upload lên bất kỳ host tĩnh nào (ví dụ staging trên duychinhdinh.com).

## Lệnh

| Lệnh                                  | Việc                                |
| ------------------------------------- | ----------------------------------- |
| `pnpm dev`                            | hạ tầng + web + server              |
| `pnpm lint`                           | ESLint + Prettier check             |
| `pnpm typecheck`                      | `tsc` mọi package                   |
| `pnpm test`                           | Vitest mọi package                  |
| `pnpm --filter @xom-oii/web test:e2e` | Playwright smoke (desktop + mobile) |
| `pnpm build`                          | build web (Vite) + server (tsup)    |
| `pnpm db:generate` / `db:migrate`     | Prisma                              |
| `pnpm infra:up` / `infra:down`        | chỉ bật/tắt docker compose          |

## Cấu trúc

```
apps/web         client 3D + UI (Vite, React, R3F, Tailwind). Admin là route /admin.
apps/server      Fastify API + Colyseus rooms, cùng một process
packages/shared  hằng số, zod schema, giờ mở cửa, proximity, sanitize text
packages/world   scene bus + thư viện, collider, seats, spots, tuyến London (dùng chung client + server)
prisma/          schema Postgres
docs/            kiến trúc, moderation, prototype
```

## Milestones

- [x] **M0** khung repo, CI, docker-compose, kiến trúc
- [x] **M1** thế giới tĩnh (vẽ lại: Bus Oii + Thư viện), đi lại, va chạm, tương tác, nhiệm vụ, joystick mobile, Playwright smoke
- [ ] **M2** multiplayer Colyseus, chat theo khoảng cách lọc ở server, instances
- [ ] **M3** magic link, OTP, invite/alumni, probation, trusted, ban liên đới
- [ ] **M4** voice LiveKit, server-controlled subscriptions, PannerNode
- [ ] **M5** admin, block/report, quest + hộ chiếu, giờ mở, privacy, deploy staging
