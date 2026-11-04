# Moderation (khung, hoàn thiện ở M5)

- **Block**: hai chiều. Không thấy chat, không nghe voice, avatar người kia mờ đi.
- **Report**: chọn lý do bắt buộc (`harassment`, `hate`, `sexual`, `spam`, `underage`, `other`), tuỳ chọn đính kèm tin nhắn gần nhất. Report voice chỉ lưu metadata, **không ghi âm**.
- **Mute**: chỉ ở phía người nghe, không báo cho người bị mute.
- **Rate limit chat**: 1 tin/giây, 20 tin/phút, tối đa 120 ký tự, chặn link.
- **Ban**: thu hồi session ngay, kick khỏi room. Với tài khoản vào bằng invite code: ban luôn người mời (luật liên đới), có AuditLog. Mã alumni do OiiMate phát không áp liên đới.
- **ChatLog**: giữ 14 ngày, chỉ admin xem khi xử lý report.
- **Admin panel** (`/admin`): hàng đợi report, ban/unban kèm cây invite, duyệt AlumniProof, tạo mã alumni theo campaign (CSV), duyệt quest, bật override giờ mở, audit log.
