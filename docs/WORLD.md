# Thế giới Xóm Oii (bản vẽ lại sau review M1)

Hướng mới: **dễ thương, đơn giản, tích cực**. Mọi người ở chung một chỗ, có việc nhỏ để làm.

## Không gian

| Scene            | Mô tả                                                                                                                                                                                            | Chat                     | Nhạc          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------- |
| `bus` (mặc định) | Tầng thượng mui trần của **Bus Oii**, chiếc bus hai tầng siêu to chạy vòng London. Địa danh trôi qua: Big Ben, London Eye, Tower Bridge, St Paul's, The Shard, Buckingham, The Gherkin, Phố Tàu. | Có (theo khoảng cách)    | Lofi tuỳ chọn |
| `library`        | Tầng dưới của bus là **Thư viện Oii**: kệ sách, bàn học đèn xanh, góc đọc, mèo ngủ, cửa sổ thấy London trôi qua.                                                                                 | **Không** (chỉ biểu cảm) | Lofi tự bật   |

- Vị trí trên tuyến tính từ giờ thật (`routeOffset(Date.now())`, `packages/world/src/route.ts`), nên mọi người, mọi instance thấy cùng một địa danh cùng lúc mà server không cần gửi thêm gì.
- Lofi được sinh bằng WebAudio (`apps/web/src/audio/lofi.ts`): không có file nhạc, không lo bản quyền, nhẹ.
- Thư viện là `quiet: true` trong `SceneDef`. Từ M2, server từ chối message chat ở scene này.

## Điều khiển (cố tình đơn giản)

- Camera **cố định góc chéo**, không xoay, không zoom.
- WASD/mũi tên theo hướng màn hình, hoặc bấm/chạm sàn để đi tới. Mobile: joystick + nút E.
- E để tương tác, 1–5 là biểu cảm, Enter để chat, Q mở nhiệm vụ.

## Nhân vật

Chibi: đầu to bo tròn, mắt chấm, má hồng, thân nhỏ, cel-shading pastel. Tuỳ biến: biệt danh, 6 màu áo, 6 mũ (nón lá, len, mũ tốt nghiệp, tai mèo, tai nghe, không mũ).

## Nhiệm vụ tuần (bản thử)

Tìm 5 vịt cao su · chụp ảnh với 3 địa danh · mua trà sữa · ngồi vào nồi lẩu chung · tập trung 1 phút ở thư viện (bản thật: pomodoro 25') · vẫy tay chào 3 người. Mỗi nhiệm vụ cho một tem trong **Hộ chiếu UK**.
