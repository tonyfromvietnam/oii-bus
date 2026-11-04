/**
 * Toàn bộ copy UI tiếng Việt (brief §15). Văn phong miền Bắc, thân, ngắn.
 * Giữ thuật ngữ Anh khi đó là văn hoá UK (meal deal, yellow sticker, pint, cuppa…).
 */
export const vi = {
  appName: "Xóm Oii",
  streetName: "Oii Street",
  tagline: "Thích ở một mình nhưng thỉnh thoảng sợ cô đơn.",
  positioning: "OiiMate cho bạn một người để nói chuyện. Xóm Oii cho bạn một chỗ có người.",

  loading: "Đang ra đầu ngõ…",
  serverDown: "Không gọi được server. Thử lại sau một lát nhé.",

  closed: {
    title: "Phố đóng cửa rồi",
    body: "Oii Street chỉ sáng đèn từ Thứ 6 19:00 tới hết Chủ nhật (giờ London).",
    countdown: "Mở lại sau",
    remindMe: "Nhắc tôi qua OiiMate",
  },

  open: {
    title: "Phố đang mở",
    placeholder: "Đèn đường đang lên. Phố 3D sẽ có ở bản M1.",
    closesAt: "Đóng cửa lúc",
  },

  units: { day: "ngày", hour: "giờ", minute: "phút", second: "giây" },
} as const;
