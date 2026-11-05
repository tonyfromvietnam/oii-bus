# Thế giới Oii-Bus (bản vẽ lại sau review M1)

Hướng mới: **dễ thương, đơn giản, tích cực**. Mọi người ở chung một chỗ, có việc nhỏ để làm.

## Không gian

| Scene            | Mô tả                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Chat                     | Nhạc          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------- |
| `bus` (mặc định) | Tầng thượng mui trần của **Oii-Bus**, chiếc bus hai tầng siêu to chạy vòng quanh UK. 28 địa danh: Big Ben, London Eye, Tower Bridge, St Paul's, The Shard, Buckingham, Windsor, Brighton Pier, vách đá trắng Dover, Stonehenge, Bath, lâu đài Cardiff, núi Snowdon, Oxford, Cotswolds, Cambridge, Birmingham Bullring, Old Trafford, Liverpool, tháp Blackpool, Lake District, York Minster, Angel of the North, tường thành Hadrian, Edinburgh, cầu Forth, Loch Ness (có Nessie), Giant's Causeway. Cảnh dọc đường đổi theo vùng: nhà stucco London, đá vàng Bath, gạch đỏ miền Bắc, đá xám Scotland, đồng quê có cừu, bãi biển chòi tắm. | Có (theo khoảng cách)    | Lofi tuỳ chọn |
| `library`        | Tầng dưới của bus là **Thư viện Oii**: kệ sách, bàn học đèn xanh, góc đọc, mèo ngủ, cửa sổ thấy London trôi qua.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Không** (chỉ biểu cảm) | Lofi tự bật   |

- **Tầng thượng = Cùng thành phố**: chọn thành phố đang ở / sắp tới, xem người cùng thành phố, tạo và tham gia kế hoạch đi chơi. Khi bus đi qua một địa danh, HUD gợi ý số người và kế hoạch ở thành phố đó.
- Thang máy (nút 🏙️ 📚 🏮 trên HUD) đi thẳng giữa ba tầng, không cần tìm cầu thang.
- Vị trí trên tuyến tính từ giờ thật (`routeOffset(Date.now())`, `packages/world/src/route.ts`), nên mọi người, mọi instance thấy cùng một địa danh cùng lúc mà server không cần gửi thêm gì.
- Lofi được sinh bằng WebAudio (`apps/web/src/audio/lofi.ts`): không có file nhạc, không lo bản quyền, nhẹ.
- Thư viện là `quiet: true` trong `SceneDef`. Từ M2, server từ chối message chat ở scene này.

## Điều khiển (cố tình đơn giản)

- Camera **cố định góc chéo**, không xoay, không zoom.
- WASD/mũi tên theo hướng màn hình, hoặc bấm/chạm sàn để đi tới. Mobile: joystick + nút E.
- E để tương tác, 1–5 là biểu cảm, Enter để chat, Q mở nhiệm vụ.

## Giao diện & nhân vật

Theo website OiiMate: nền xanh bạc hà `#f1f8ec`, nút teal `#4e9297`, chữ navy `#1f2d4d`, font Nunito, bong bóng chat có viền và đuôi.

Nhân vật tròn như mascot OiiMate: bong bóng chat có đuôi nhỏ, mắt chấm navy, miệng cười, tay chân tí hon, nhún kiểu thạch khi đi. Tuỳ biến: biệt danh, 6 màu áo, 6 mũ (nón lá, len, mũ tốt nghiệp, tai mèo, tai nghe, không mũ).

## Nhiệm vụ tuần (bản thử)

Tìm 5 vịt cao su · chụp ảnh với 3 địa danh · mua trà sữa · ngồi vào nồi lẩu chung · tập trung 1 phút ở thư viện (bản thật: pomodoro 25') · vẫy tay chào 3 người. Mỗi nhiệm vụ cho một tem trong **Hộ chiếu UK**.

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
