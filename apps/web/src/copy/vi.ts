import type { LandmarkId } from "@xom-oii/world";

/**
 * Toàn bộ copy UI tiếng Việt (brief §15). Văn phong miền Bắc, thân, vui, ngắn.
 * Giữ thuật ngữ Anh khi đó là văn hoá UK (meal deal, yellow sticker, deadline, landlord…).
 */
export const vi = {
  appName: "Xóm Oii",
  tagline: "Thích ở một mình nhưng thỉnh thoảng sợ cô đơn.",
  positioning: "OiiMate cho bạn một người để nói chuyện. Xóm Oii cho bạn một chỗ có người.",

  loading: "Đang đợi bus…",
  loadingWorld: "Bus Oii sắp tới bến…",
  serverDown: "Không gọi được server. Thử lại sau một lát nhé.",

  closed: {
    title: "Bus Oii về bến rồi",
    body: "Xóm Oii mở từ Thứ 6 19:00 tới hết Chủ nhật (giờ London).",
    countdown: "Chuyến tiếp theo sau",
    remindMe: "Nhắc tôi qua OiiMate",
    preview: "Xem thử (offline)",
  },

  units: { day: "ngày", hour: "giờ", minute: "phút", second: "giây" },

  scenes: {
    bus: { name: "Bus Oii", sub: "tầng thượng · đang vòng quanh UK" },
    library: { name: "Thư viện Oii", sub: "tầng dưới · suỵt, yên lặng nhé 🤫" },
  },

  creator: {
    title: "Chào bạn mới!",
    body: "Chọn một chút cho nhân vật rồi lên xe nhé.",
    nickname: "Biệt danh",
    color: "Màu áo",
    hat: "Mũ",
    go: "Lên xe! 🚌",
    randomNames: [
      "Bánh Bao",
      "Trà Sữa",
      "Bánh Mì",
      "Su Kem",
      "Mít Tố Nữ",
      "Cún Con",
      "Khoai Lang",
      "Bé Bơ",
      "Xôi Gà",
      "Chè Khúc Bạch",
    ],
  },
  hats: {
    none: "Không",
    "non-la": "Nón lá",
    beanie: "Len",
    "grad-cap": "Tốt nghiệp",
    "cat-ears": "Tai mèo",
    headphones: "Tai nghe",
  },

  hud: {
    offlineBadge: "Bản thử · offline · bạn bè trên xe là bot",
    now: "Đang qua",
    next: "Sắp tới",
    meters: "m",
    quests: "Nhiệm vụ",
    passport: "Hộ chiếu",
    chat: "Chat",
    chatPlaceholder: "Nói gì đó… (Enter gửi, Esc huỷ)",
    quietChat: "Thư viện yên lặng: chỉ dùng biểu cảm thôi nha 🤫",
    you: "Bạn",
    murmur: "· · ·",
    music: "Lofi",
    musicOn: "Đang phát lofi",
    musicOff: "Bật lofi",
    volume: "Âm lượng",
    help: "Cách chơi",
    close: "Đóng",
    voiceLocked: "Voice mở sau 14 ngày hoặc khi bạn thành Đã tin cậy.",
    welcome:
      "Chào mừng lên Bus Oii! Xe chạy vòng quanh UK cả cuối tuần, từ London tới Edinburgh. Đi dạo, uống trà sữa, nhặt vịt, hay xuống thư viện nghe lofi nhé.",
    focusStart: "Bắt đầu tập trung",
    focusStop: "Dừng",
    focusing: "Đang tập trung",
  },

  help: [
    ["W A S D / ←↑↓→", "Đi lại"],
    ["Bấm / chạm sàn", "Đi tới chỗ đó"],
    ["E", "Tương tác · ngồi · đứng dậy"],
    ["Enter", "Chat"],
    ["1 – 5", "Biểu cảm"],
    ["Q", "Nhiệm vụ & hộ chiếu"],
  ],

  gestures: {
    wave: { emoji: "👋", label: "Chào" },
    tea: { emoji: "🧋", label: "Mời trà sữa" },
    hug: { emoji: "🫶", label: "Thương" },
    sorry: { emoji: "🙇", label: "Sorry" },
    cheers: { emoji: "🥳", label: "Yeah" },
  },
  needTea: "Phải cầm trà sữa mới mời được. Ra quầy trà sữa nhé 🧋",

  prompts: {
    seat: "Ngồi",
    standUp: "Đứng dậy",
    photo: "Chụp ảnh với địa danh 📸",
    "bubble-tea": "Mua trà sữa £3.80",
    karaoke: "Hát karaoke",
    "meal-deal": "Mua meal deal £3.50",
    "quest-board": "Xem nhiệm vụ",
    umbrella: "Lấy ô",
    "to-library": "Xuống thư viện 📚",
    "to-bus": "Lên tầng thượng 🚌",
    bookshelf: "Lấy một cuốn sách",
    cat: "Vuốt mèo",
    radio: "Bật/tắt lofi",
    duck: "Nhặt vịt 🦆",
  },

  lines: {
    photoNone: "Chưa có địa danh nào ngang xe. Đợi chút nhé!",
    photoTaken: (name: string) => `📸 Tách! Ảnh với ${name} đã vào hộ chiếu.`,
    photoAgain: (name: string) => `Bạn có ảnh với ${name} rồi, thêm một tấm cho chắc 📸`,
    teaBought: "Một cốc trà sữa trân châu đường đen, ít đá. Chuẩn vị 🧋",
    teaHolding: "Tay đang cầm trà sữa rồi, uống hết đã!",
    broke: "Hết tiền ảo rồi. Tuần sau quay lại nhé 🥲",
    karaoke: [
      "🎤 Bạn hát một bài ballad, cả xe vỗ tay 👏",
      "🎤 Lên nốt cao… hơi phô, nhưng mà tình cảm 💛",
      "🎤 Song ca với bot Su Su. Hay hơn mong đợi!",
    ],
    mealDeal: [
      "Sandwich gà, snack, nước cam. Meal deal kinh điển 🥪",
      "Máy nhả ra một gói yellow sticker 25p. Hời quá!",
    ],
    umbrella: "Ô để sẵn cho mọi người. Đây là London mà ☂️",
    toLibrary: "Xuống cầu thang… tầng dưới là thư viện! Lofi đang phát 🎧",
    toBus: "Lên tầng thượng, gió mát quá 🌤️",
    books: [
      "📖 “Viết essay 3000 chữ trong một đêm (và sống sót)”",
      "📖 “Harvard referencing cho người mới”",
      "📖 “100 món ngon từ mì tôm và trứng”",
      "📖 “Nói chuyện với landlord: tập 2”",
      "📖 “Hiểu người Anh qua 50 câu ‘Sorry’”",
    ],
    cat: [
      "🐈 Mèo thư viện kêu “meo” rất khẽ.",
      "🐈 Mèo lim dim, kệ bạn.",
      "🐈 Mèo ngửi cốc trà sữa của bạn rồi bỏ đi.",
    ],
    duck: (n: number) => `🦆 Nhặt được vịt cao su! (${n}/5)`,
    focusDone: "Tập trung xong một phiên. Giỏi quá! 📚",
  },

  landmarks: {
    "big-ben": { name: "Big Ben · London", joke: "Đồng hồ này đúng giờ hơn bus nhiều 😅" },
    "london-eye": { name: "London Eye", joke: "Vé £30, ngắm từ bus thì free 🎡" },
    "tower-bridge": { name: "Tower Bridge", joke: "Không phải London Bridge đâu nha 🌉" },
    buckingham: { name: "Cung điện Buckingham", joke: "Vua có ở nhà không ta? 👑" },
    "brighton-pier": { name: "Brighton Pier", joke: "Biển Anh: gió nhiều hơn nắng, nhưng vẫn vui 🌊" },
    stonehenge: { name: "Stonehenge · Wiltshire", joke: "5000 năm rồi vẫn chưa ai biết để làm gì 🪨" },
    bath: { name: "Royal Crescent · Bath", joke: "Phim cổ trang quay ở đây suốt 🎩" },
    oxford: { name: "Radcliffe Camera · Oxford", joke: "Thư viện đẹp thế này, deadline cũng dịu đi 📚" },
    birmingham: { name: "Bullring · Birmingham", joke: "Toà nhà đính 15.000 cái đĩa bạc ✨" },
    "old-trafford": {
      name: "Old Trafford · Manchester",
      joke: "Cuối tuần có trận thì cả thành phố đỏ rực ⚽",
    },
    liverpool: { name: "Royal Liver Building · Liverpool", joke: "Hai chú chim Liver canh bến cảng 🐦" },
    "angel-north": { name: "Angel of the North · Gateshead", joke: "Sải cánh 54 m, rộng hơn máy bay 747 ✈️" },
    edinburgh: { name: "Lâu đài Edinburgh", joke: "Lên Scotland rồi, nhớ mang áo ấm 🏴" },
  } satisfies Record<LandmarkId, { name: string; joke: string }>,

  quests: {
    title: "Nhiệm vụ tuần này",
    passportTitle: "Hộ chiếu UK",
    stampEarned: (t: string) => `🎉 Nhận tem: ${t}`,
    empty: "Chưa có tem nào. Làm nhiệm vụ để sưu tầm nhé!",
    items: {
      ducks: { title: "Tìm 5 chú vịt cao su trên xe", stamp: "Thợ săn vịt", icon: "🦆" },
      photos: { title: "Chụp ảnh với 3 địa danh", stamp: "Khách du lịch", icon: "📸" },
      tea: { title: "Mua một cốc trà sữa", stamp: "Hội trà sữa", icon: "🧋" },
      hotpot: { title: "Ngồi vào nồi lẩu chung", stamp: "Lẩu là chân ái", icon: "🍲" },
      focus: { title: "Tập trung 1 phút ở thư viện", stamp: "Mọt sách", icon: "📚" },
      wave: { title: "Vẫy tay chào 3 người", stamp: "Người quen của cả xe", icon: "👋" },
    },
  },
} as const;

export type QuestId = keyof typeof vi.quests.items;
