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
  loadingStreet: "Đang thắp đèn đường…",
  serverDown: "Không gọi được server. Thử lại sau một lát nhé.",

  closed: {
    title: "Phố đóng cửa rồi",
    body: "Oii Street chỉ sáng đèn từ Thứ 6 19:00 tới hết Chủ nhật (giờ London).",
    countdown: "Mở lại sau",
    remindMe: "Nhắc tôi qua OiiMate",
    preview: "Xem thử phố (offline)",
  },

  open: {
    closesAt: "Đóng cửa lúc",
  },

  units: { day: "ngày", hour: "giờ", minute: "phút", second: "giây" },

  hud: {
    offlineBadge: "Bản thử M1 · offline · bạn đang ở phố một mình",
    weather: "Mưa phùn",
    wallet: "Ví",
    help: "Điều khiển",
    close: "Đóng",
    chatPlaceholder: "Nói gì đó… (Enter để gửi, Esc để huỷ)",
    chatButton: "Chat",
    you: "Bạn",
    murmur: "· · ·",
    voiceLocked: "Voice mở sau 14 ngày hoặc khi bạn thành Đã tin cậy.",
    welcome: "Chào mừng tới Oii Street. Đi dạo, ngồi bến bus, hay ghé Oii Express mua cốc trà nhé.",
  },

  helpDesktop: [
    ["W A S D / ←↑↓→", "Đi lại (Shift để đi nhanh)"],
    ["Kéo chuột", "Xoay camera"],
    ["Con lăn", "Zoom gần/xa"],
    ["Bấm xuống đường", "Đi tới chỗ đó"],
    ["E", "Tương tác / ngồi / lên bus"],
    ["Enter", "Chat"],
    ["1 – 5", "Cử chỉ"],
    ["V", "Giữ để nói (sắp có)"],
  ],
  helpTouch: [
    ["Joystick trái", "Đi lại"],
    ["Vuốt bên phải", "Xoay camera"],
    ["Chạm mặt đường", "Đi tới chỗ đó"],
    ["Nút E", "Tương tác / ngồi / lên bus"],
  ],

  gestures: {
    wave: { emoji: "👋", label: "Vẫy" },
    tea: { emoji: "☕", label: "Mời trà" },
    hug: { emoji: "🫂", label: "Ôm" },
    sorry: { emoji: "🙇", label: "Sorry!" },
    cheers: { emoji: "🍻", label: "Cheers" },
  },
  needTea: "Phải cầm trà mới mời được. Ghé Oii Express nhé ☕",

  prompts: {
    "phone-box": "Gọi về nhà",
    postbox: "Gửi bưu thiếp",
    shop: "Mua trà £1.20",
    "npc-dave": "Chào Dave",
    "door-17": "Gõ cửa nhà 17",
    "pub-door": "Vào The Oii Arms",
    "quest-board": "Xem bảng nhiệm vụ",
    seat: "Ngồi",
    "bus-door": "Lên bus N29",
    alight: "Xuống bus",
    standUp: "Đứng dậy",
  },

  ringRing: "☎️ Ring ring…",
  callHome: [
    "“Alo mẹ ạ… con ăn rồi, meal deal ạ. Vâng, có rau mà.”",
    "“Bên này mới 5 giờ chiều đã tối om rồi bố ạ.”",
    "“Con vẫn ổn, chỉ hơi nhớ bát phở đầu ngõ thôi.”",
    "“Mẹ ơi con nấu được canh chua rồi nhé! Hơi chua quá.”",
    "“Không ai nghe máy. Chắc nhà đang ngủ, bên đó 1 giờ sáng rồi.”",
  ],
  postbox: [
    "Bạn thả một tấm bưu thiếp về nhà. Chắc 2 tuần nữa mới tới 📮",
    "Bưu thiếp in hình bus đỏ. Mặt sau ghi: “Con ổn. Trời mưa.” 📮",
    "Royal Mail cảm ơn bạn. Tem £1.70, đắt hơn cốc trà 📮",
  ],
  shop: {
    bought: "Mua một cốc trà £1.20. Ấm tay hẳn ☕",
    alreadyHolding: "Tay đang cầm trà rồi. Uống hết đã nhé.",
    broke: "Hết tiền ảo rồi. Tuần sau quay lại nhé.",
    flavour: [
      "Kệ yellow sticker hôm nay có sandwich 25p 👀",
      "Meal deal £3.50: sandwich, snack, nước. Kinh điển.",
    ],
  },
  door17: "Nhà số 17 đang khoá. Bếp chung mở ở bản sau 🔑",
  pubDoor: "Trong pub chưa mở. Mở ở bản sau 🍺 Ngồi bàn ngoài trời trước nhé.",
  questBoard: "Bảng nhiệm vụ tuần sắp có: làm quest, nhận tem hộ chiếu UK 🛂",
  bus: {
    boarded: "Lên tầng trên N29. Ngồi ngắm phố nhé 🚌",
    alighted: "Xuống bus. Cảm ơn bác tài!",
    notYet: "Đợi bus dừng ở bến đã.",
  },
  chat: {
    rejectedLink: "Chưa cho gửi link trong phố đâu nhé.",
    tooFast: "Từ từ thôi, mỗi giây một câu.",
  },

  dave: {
    name: "Dave",
    lines: [
      "Alright, mate? Cuppa or a pint?",
      "Proper miserable out, innit.",
      "Bus'll be along in a bit, love.",
      "Mind the puddles, yeah?",
      "Lovely evening for it. If you're a duck.",
      "Fancy a bag of crisps? Salt and vinegar, obviously.",
      "Cheers, mate!",
    ],
  },
} as const;

export type GestureId = keyof typeof vi.gestures;
