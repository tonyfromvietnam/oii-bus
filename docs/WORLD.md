# Thế giới Oii-Bus (bản vẽ lại sau review M1)

Hướng mới: **dễ thương, đơn giản, tích cực**. Mọi người ở chung một chỗ, có việc nhỏ để làm.

## Không gian: một tầng thượng siêu to

Giống một chánh điện online: **mọi người ở chung một sàn**, không có tầng, không có thang máy. Sàn rộng 88 × 22 m trên nóc Oii-Bus, chạy vòng quanh UK (28 địa danh trôi qua phía sau, vị trí tính từ giờ thật nên ai cũng thấy cùng một cảnh).

Từ đuôi tới đầu xe (`DECK_ZONES` trong `packages/world/src/scenes.ts`):

| Khu                     | Có gì                                                                                                       | Quầy làm việc  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- |
| 🏮 Chùa Cầu Duyên       | Chính điện mái cong, lư hương, mõ gỗ to, chuông, miếu Ông Tơ Bà Nguyệt, cây duyên chỉ đỏ, bồ đoàn, đèn lồng | 🪵 Gõ mõ       |
| 📝 Góc Deadline         | Bàn học, laptop sáng màn hình, kệ sách, đồng hồ 23:59                                                       | 📝 Gõ essay    |
| 💅 OiiNails             | Kệ hàng trăm lọ sơn, máy hơ gel tím, ghế khách hồng                                                         | 💅 Làm nails   |
| ⭐ Quảng trường OiiMate | Logo OiiMate in trên sàn, tượng mascot trên **Máy farm công đức** (bấm để treo máy), chỗ xuất phát          |                |
| 🍜 Oii Viet             | Bếp phở, nồi nước dùng bốc khói, chồng bát, thực đơn, ghế nhựa đỏ, lẩu chung                                | 🍜 Bê phở      |
| 🧋 Oii Tea              | Quầy trà sữa, cốc trà sữa khổng lồ                                                                          | 🧋 Lắc trà sữa |
| 📸 Mũi xe               | Khung chụp ảnh với địa danh, karaoke, bảng Cùng thành phố                                                   |                |

Logo OiiMate (hai bong bóng chat) vẽ bằng code trong `apps/web/src/scene/oiiLogo.ts`: trên biển mọi quầy, cờ dọc lan can, thân xe, sàn quảng trường và HUD.

## Máy farm công đức (cày và treo máy)

Logic thuần ở `packages/shared/src/farm.ts` (có test), client ở `apps/web/src/game/farm.ts`.

| Quầy        | Mỗi việc             | Người giúp (giá đầu) | Người giúp làm |
| ----------- | -------------------- | -------------------- | -------------- |
| Bê phở      | £1 · 1 XP            | Phụ bếp (£15)        | 0,5 bát/giây   |
| Làm nails   | £2 · 1 XP            | Thợ nails (£30)      | 0,3 bộ/giây    |
| Lắc trà sữa | £0,5 · 1 XP          | Máy lắc (£8)         | 0,8 cốc/giây   |
| Gõ essay    | 3 XP (không ra tiền) | Cốc cà phê (£20)     | 0,25 đoạn/giây |
| Gõ mõ       | 1 XP · +1 công đức   | Máy gõ mõ (£10)      | 1 tiếng/giây   |

- **Bấm/giữ** nút to ở quầy (hoặc Space) để tự làm. Tối đa 15 lần/giây được tính (chống auto-click).
- **Thuê người giúp**: giá tăng ×1,55 mỗi người. Người giúp đứng sau quầy nhún nhảy làm việc.
- **Treo máy** (nút 😴, phím Z, hoặc tượng ở quảng trường): màn tối, ngừng vẽ 3D cho đỡ tốn pin, giữ màn hình sáng (Wake Lock), người giúp làm **nhanh gấp đôi**, bạn tự làm thêm 1 việc/giây ở quầy gần nhất.
- **Đóng app vẫn được tính**: mở lại là tính bù theo giờ thật (tối đa 12 tiếng) và hiện bảng "Trong lúc bạn đi vắng". Tab bị ẩn cũng vậy (trình duyệt hạn chế đồng hồ nền, nên game tính theo mốc thời gian chứ không đếm nhịp).
- **Mốc khoe**: 100, 500, 1.000, 5.000, 10.000… việc mỗi quầy, +50 XP thưởng.
- Công đức từ gõ mõ cộng vào phúc đức để xin quẻ se duyên. Hệ số may mắn vẫn có trần ×3 (`matchWeight`), nên treo máy không "mua" được người.
- Bản thử lưu trong trình duyệt. Từ M3 server giữ `FarmState` và tính lại bằng cùng hàm `advance` (không tin client).

## Điều khiển (cố tình đơn giản)

- Camera **cố định góc chéo**, không xoay, không zoom.
- WASD/mũi tên theo hướng màn hình, hoặc bấm/chạm sàn để đi tới. Mobile: joystick + nút E.
- Chạy nhanh (6,5 m/s) vì sàn rộng; thanh khu ở dưới màn hình để chạy thẳng tới khu cần đến.
- E để vào quầy / tương tác, Space để làm việc, Z để treo máy, 1–5 là biểu cảm, Enter để chat.

## Giao diện & nhân vật

Theo website OiiMate: nền xanh bạc hà `#f1f8ec`, nút teal `#4e9297`, chữ navy `#1f2d4d`, font Nunito, bong bóng chat có viền và đuôi.

Nhân vật tròn như mascot OiiMate: bong bóng chat có đuôi nhỏ, mắt chấm navy, miệng cười, tay chân tí hon, nhún kiểu thạch khi đi. Tuỳ biến: biệt danh, 6 màu áo, 6 mũ (nón lá, len, mũ tốt nghiệp, tai mèo, tai nghe, không mũ).

## Phúc đức & se duyên (luật ở `packages/shared`)

| Việc                     | Điểm           | Giới hạn                   |
| ------------------------ | -------------- | -------------------------- |
| Thắp hương               | +3             | 1 lần/phút, tối đa 15/ngày |
| Tụng kinh (ngồi bồ đoàn) | +1 mỗi 10 giây | 30/ngày                    |
| Công đức (£ ảo)          | +2 mỗi £1      | 30/ngày                    |
| Buộc chỉ đỏ              | +5             | 5/ngày                     |
| Thỉnh chuông             | +1             | 1 lần/30 giây, 5/ngày      |

- Hệ số may mắn `matchWeight = min(3, 1 + log2(1 + phúc đức/20))`: tăng chậm dần, tối đa ×3, không bao giờ bảo đảm.
- Hàng đợi ưu tiên người chờ lâu; phúc đức chỉ cộng thêm tương đương ~40 giây chờ.
- Không ghép người đã chặn nhau hoặc vừa ghép với nhau. "Ai cũng được" chỉ ghép khi cả hai bên đều chọn.
- Điểm reset mỗi tuần.

## Graphics

Nhân vật giữ cel-shading. Cảnh vật dùng vật liệu PBR, texture tự vẽ (sàn gỗ, nhựa đường, cỏ, gạch, đá lát), ánh sáng môi trường (RoomEnvironment), bóng đổ mềm. `?lowfx` tắt bóng đổ cho máy yếu.

## Vòng lặp hằng ngày (giữ chân người chơi)

| Phần          | Cách hoạt động                                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔥 Chuỗi ngày | Mỗi ngày (theo giờ London) lên xe một lần: +10 XP, cộng thêm 2 XP mỗi ngày liên tiếp (tối đa +20). Bỏ một ngày thì chuỗi bắt đầu lại, giữ kỷ lục.                     |
| Cấp theo zone | Lv 1, 2, 3… không giới hạn, kèm Zone 6 "Mới lên xe" → Zone 1 "Dân London chính hiệu" → Zone VIP "Tiền bối Oii-Bus" (`ZONES` trong `packages/shared/src/progress.ts`). |
| XP            | Mỗi việc ở quầy 1–3 · mốc khoe 50 · thắp hương 5 · tụng kinh 1/10 giây · chụp địa danh 5 · kế hoạch 10… (`XP`).                                                       |
| Thẻ khoe      | Ảnh 1080×1350 kiểu OiiMate: mascot, chuỗi ngày, cấp, 3 số liệu hôm nay, câu của ngày, link mời `?ref=`.                                                               |
| Câu mỗi ngày  | Ai mở cùng ngày thấy cùng câu (`pickForDay`).                                                                                                                         |

Bản thử lưu tiến độ trong trình duyệt. Từ M3, server giữ XP/chuỗi ngày và ghi nhận lượt mời, dùng cùng hàm trong `@oii-bus/shared`.
