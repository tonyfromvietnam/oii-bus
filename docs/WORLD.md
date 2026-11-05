# Thế giới Oii-Bus (bản vẽ lại sau review M1)

Hướng mới: **dễ thương, đơn giản, tích cực**. Mọi người ở chung một chỗ, có việc nhỏ để làm.

## Không gian

| Scene            | Mô tả                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Chat                     | Nhạc          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------- |
| `bus` (mặc định) | Tầng thượng mui trần của **Oii-Bus**, chiếc bus hai tầng siêu to chạy vòng quanh UK. 28 địa danh: Big Ben, London Eye, Tower Bridge, St Paul's, The Shard, Buckingham, Windsor, Brighton Pier, vách đá trắng Dover, Stonehenge, Bath, lâu đài Cardiff, núi Snowdon, Oxford, Cotswolds, Cambridge, Birmingham Bullring, Old Trafford, Liverpool, tháp Blackpool, Lake District, York Minster, Angel of the North, tường thành Hadrian, Edinburgh, cầu Forth, Loch Ness (có Nessie), Giant's Causeway. Cảnh dọc đường đổi theo vùng: nhà stucco London, đá vàng Bath, gạch đỏ miền Bắc, đá xám Scotland, đồng quê có cừu, bãi biển chòi tắm. | Có (theo khoảng cách)    | Lofi tuỳ chọn |
| `library`        | Tầng dưới của bus là **Thư viện Oii**: kệ sách, bàn học đèn xanh, góc đọc, mèo ngủ, cửa sổ thấy London trôi qua.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Không** (chỉ biểu cảm) | Lofi tự bật   |

- **Tầng thượng = Cùng thành phố**: chọn thành phố đang ở / sắp tới, xem người cùng thành phố, tạo và tham gia kế hoạch đi chơi. Khi bus đi qua một địa danh, HUD gợi ý số người và kế hoạch ở thành phố đó.
- Thanh tầng trên HUD (🏪 Phố UK, 🚌, 📚, 🏮) đi thẳng giữa các tầng; tầng chưa mở có 🔒, không cần tìm cầu thang.
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

## Vòng lặp hằng ngày (giữ chân người chơi)

| Phần          | Cách hoạt động                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔥 Chuỗi ngày | Mỗi ngày (theo giờ London) lên xe một lần: +10 XP, cộng thêm 2 XP mỗi ngày liên tiếp (tối đa +20). Bỏ một ngày thì chuỗi bắt đầu lại, giữ kỷ lục. |
| Cấp theo zone | Zone 6 "Mới lên xe" → Zone 1 "Dân London chính hiệu" → Zone VIP "Tiền bối Oii-Bus" (`ZONES` trong `packages/shared/src/progress.ts`).             |
| XP            | Thắp hương 5 · tụng kinh 1/10 giây · tập trung 2/phút (+20 mỗi phiên) · tem 15 · chụp địa danh 5 · kế hoạch 10 · việc tân sinh viên 10… (`XP`).   |
| Thẻ khoe      | Ảnh 1080×1350 kiểu OiiMate: mascot, chuỗi ngày, cấp, 3 số liệu hôm nay, câu của ngày, link mời `?ref=`.                                           |
| Câu mỗi ngày  | Ai mở cùng ngày thấy cùng câu (`pickForDay`).                                                                                                     |

## Cẩm nang tân sinh viên (chiến dịch 7 ngày)

Người mới vào game bắt đầu ở **Phố UK** (`street`): một con phố low-poly có Arrivals, ngân hàng, letting agent, GP, pharmacy, siêu thị, chợ châu Á, tiệm giặt, quán cà phê, ga tàu, lều Freshers và trạm Oii-Bus. Mỗi ngày mở **3 nhiệm vụ**, làm bằng hành động thật: đi tới cửa hàng, nói chuyện với NPC, rồi trả lời câu đố / xếp thứ tự / chọn đồ / làm cùng bạn đồng hành.

| Ngày | Chủ đề              | Mở khoá          |
| ---- | ------------------- | ---------------- |
| 1    | 24 giờ đầu tiên     | Tầng bus         |
| 2    | Tìm chỗ ở           | Thư viện         |
| 3    | Giấy tờ & ngân hàng | Cùng thành phố   |
| 4    | Đi lại              | Chùa Cầu Duyên   |
| 5    | Ăn uống & săn sale  |                  |
| 6    | Sức khoẻ & mùa đông |                  |
| 7    | Việc làm & kết nối  | Xin quẻ se duyên |

- Làm xong 3 việc của ngày thì chương sau mở vào **ngày London tiếp theo** (`chapterState` trong `packages/shared/src/handbook.ts`), để người chơi quay lại mỗi ngày.
- Ngày 1 ghép **bạn đồng hành** ở lều Freshers (`pickMatch`). Bạn đi theo qua các tầng, chat 1:1, và cần đứng gần cho nhiệm vụ đôi (giặt đồ, đi bus, ăn lẩu).
- Nội dung lấy từ sheet Q&A của OiiMate (đã làm gọn), kèm link gov.uk, NHS, TfL. Tab Hỏi đáp trong cẩm nang có ~55 câu.
- `?unlock=all` mở hết tầng và chương.

Bản thử lưu tiến độ trong trình duyệt. Từ M3, server giữ XP/chuỗi ngày và ghi nhận lượt mời, dùng cùng hàm trong `@oii-bus/shared`.
