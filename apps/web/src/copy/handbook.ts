import type { PlaceId } from "@oii-bus/world";

/**
 * Cẩm nang tân sinh viên (bản thử). Nội dung hỏi–đáp lấy từ "Bank câu hỏi" của đội OiiMate,
 * bổ sung kinh nghiệm cộng đồng (Reddit/The Student Room) và cảnh báo lừa đảo của các trường + gov.uk.
 * Thông tin tham khảo: luôn kiểm tra trang chính thức.
 */

export interface PlaceInfo {
  name: string;
  sign: string;
  icon: string;
  npc: string;
  hello: string;
  /** Chủ đề hỏi–đáp gợi ý khi ghé chơi. */
  topic?: TopicId;
}

export const PLACES: Record<PlaceId, PlaceInfo> = {
  arrivals: {
    name: "Sảnh đến sân bay",
    sign: "ARRIVALS ✈️",
    icon: "✈️",
    npc: "Chị Mai (năm 3)",
    hello: "Chào em! Vừa hạ cánh hả? Có mạng trước đã, rồi giữ folder giấy tờ cẩn thận nhé.",
    topic: "pre",
  },
  bank: {
    name: "Ngân hàng",
    sign: "BANK 🏦",
    icon: "🏦",
    npc: "Anh Tuấn (đã đi làm)",
    hello: "Mở tài khoản không khó, chỉ cần đúng thứ tự thôi em.",
    topic: "bank",
  },
  letting: {
    name: "Văn phòng nhà đất",
    sign: "LETTINGS 🏠",
    icon: "🏠",
    npc: "Chị Hà (ở London 4 năm)",
    hello: "Tìm nhà thì nhớ: chưa xem nhà, chưa chuyển cọc.",
    topic: "home",
  },
  gp: {
    name: "Phòng khám GP",
    sign: "GP SURGERY 🩺",
    icon: "🩺",
    npc: "Bác sĩ Smith",
    hello: "Đăng ký GP miễn phí, làm ngay cả khi đang khoẻ nhé.",
    topic: "health",
  },
  pharmacy: {
    name: "Hiệu thuốc",
    sign: "PHARMACY 💊",
    icon: "💊",
    npc: "Dược sĩ Priya",
    hello: "Hỏi dược sĩ là miễn phí đó. Da khô? Mình có cách.",
    topic: "health",
  },
  supermarket: {
    name: "Siêu thị giá rẻ",
    sign: "SUPERMARKET 🛒",
    icon: "🛒",
    npc: "Bạn Linh (thợ săn tem vàng)",
    hello: "Cuối ngày là giờ vàng: tem vàng giảm giá mạnh lắm!",
    topic: "food",
  },
  asian: {
    name: "Tạp hoá châu Á",
    sign: "Á ĐÔNG 🥢",
    icon: "🥢",
    npc: "Cô Lan (chủ tiệm)",
    hello: "Nước mắm, mì tôm, rau thơm đủ cả. Thịt về nhớ sơ chế kỹ nha con.",
    topic: "food",
  },
  laundrette: {
    name: "Tiệm giặt sấy",
    sign: "LAUNDRETTE 🧺",
    icon: "🧺",
    npc: "Anh Khoa",
    hello: "Mùa đông phơi mãi không khô? Ra đây sấy 30 phút £1–2 là xong.",
    topic: "home",
  },
  cafe: {
    name: "Quán phở tuyển người",
    sign: "PHỞ · Tuyển phục vụ ☕",
    icon: "☕",
    npc: "Chú Bình (chủ quán)",
    hello: "Đi làm thêm thì đúng luật nhé: tối đa 20 giờ/tuần trong kỳ học.",
    topic: "work",
  },
  station: {
    name: "Ga tàu",
    sign: "STATION 🚆",
    icon: "🚆",
    npc: "Nhân viên ga Tom",
    hello: "Railcard + Oyster là combo tiết kiệm nhất cho sinh viên.",
    topic: "travel",
  },
  freshers: {
    name: "Freshers' Fair",
    sign: "FRESHERS' FAIR 🎪",
    icon: "🎪",
    npc: "Hội sinh viên Việt Nam",
    hello: "Chào bạn mới! Ghép một bạn đồng hành để cùng làm nhiệm vụ nhé.",
    topic: "fun",
  },
  busstop: {
    name: "Bến Oii-Bus",
    sign: "Oii-Bus 🚌",
    icon: "🚌",
    npc: "Bác tài",
    hello: "Lên xe vòng quanh UK nào! (mở sau Ngày 1)",
  },
};

export type QuestType = "quiz" | "order" | "pick" | "buddy" | "duo" | "chat" | "wave" | "duyen";

interface QuestBase {
  id: string;
  type: QuestType;
  title: string;
  place?: PlaceId;
  /** Giải thích hiện ra sau khi làm xong (kiến thức thật). */
  explain: string;
  link?: { label: string; url: string };
}
export interface QuizQuest extends QuestBase {
  type: "quiz";
  question: string;
  options: string[];
  answer: number;
}
export interface OrderQuest extends QuestBase {
  type: "order";
  prompt: string;
  /** Đúng thứ tự. Trò chơi sẽ xáo trộn. */
  steps: string[];
}
export interface PickQuest extends QuestBase {
  type: "pick";
  prompt: string;
  options: { text: string; ok: boolean; tag?: string }[];
}
export interface SocialQuest extends QuestBase {
  type: "buddy" | "duo" | "chat" | "wave" | "duyen";
  hint: string;
}
export type Quest = QuizQuest | OrderQuest | PickQuest | SocialQuest;

export interface Chapter {
  day: number;
  title: string;
  icon: string;
  unlock: string;
  quests: Quest[];
}

export const CHAPTERS: Chapter[] = [
  {
    day: 1,
    title: "24 giờ đầu tiên",
    icon: "🛬",
    unlock: "Mở khoá: lên Oii-Bus 🚌",
    quests: [
      {
        id: "d1-folder",
        type: "pick",
        place: "arrivals",
        title: "Soạn folder “bất ly thân”",
        prompt: "Chọn những thứ phải để trong hành lý xách tay khi nhập cảnh:",
        options: [
          { text: "Hộ chiếu có visa", ok: true },
          { text: "Thư CAS", ok: true },
          { text: "Thư mời nhập học (Offer letter)", ok: true },
          { text: "eVisa / share code (in sẵn)", ok: true },
          { text: "£5.000 tiền mặt trong vali", ok: false },
          { text: "Vàng mang sang bán", ok: false },
        ],
        explain:
          "Nên in sẵn giấy tờ. Tiền mặt dưới £10.000 thì không phải khai báo, nhưng chỉ nên mang £300–500 cho an toàn, còn lại để trong thẻ quốc tế.",
      },
      {
        id: "d1-sim",
        type: "quiz",
        place: "arrivals",
        title: "Có mạng ngay khi hạ cánh",
        question: "SIM mua ở sân bay nên dùng thế nào?",
        options: [
          "Dùng luôn cả năm cho tiện",
          "Chỉ để có mạng tuần đầu, ổn định rồi đổi gói sinh viên online",
          "Không cần SIM, dùng wifi là đủ",
          "Bỏ SIM Việt Nam đi cho nhẹ",
        ],
        answer: 1,
        explain:
          "SIM sân bay là giải pháp “chữa cháy”. Gói tốt cho sinh viên (Smarty, Lebara, Voxi…) đăng ký online sau. Nhớ giữ SIM Việt Nam để nhận OTP ngân hàng ở nhà.",
      },
      {
        id: "d1-buddy",
        type: "buddy",
        place: "freshers",
        title: "Ghép một bạn đồng hành",
        hint: "Ra gian Freshers' Fair, bấm E để được ghép ngẫu nhiên với một bạn mới sang.",
        explain: "Có bạn đi cùng thì đỡ cô đơn hẳn. Bạn đồng hành sẽ làm nhiệm vụ cùng bạn mỗi ngày.",
      },
    ],
  },
  {
    day: 2,
    title: "Tìm chỗ ở",
    icon: "🏠",
    unlock: "Mở khoá: Thư viện 📚",
    quests: [
      {
        id: "d2-scam",
        type: "quiz",
        place: "letting",
        title: "Né lừa đảo thuê nhà",
        question: "Chủ nhà “ở xa” giục bạn chuyển cọc trước rồi gửi chìa khoá qua bưu điện. Làm gì?",
        options: [
          "Chuyển luôn kẻo mất phòng",
          "Không chuyển tiền khi chưa xem nhà (hoặc video call thấy rõ người và phòng)",
          "Chuyển một nửa cho chắc",
          "Nhờ bạn chuyển hộ",
        ],
        answer: 1,
        explain:
          "Red flag lớn nhất! Tiền cọc tối đa 5 tuần tiền thuê và phải được gửi vào chương trình bảo vệ cọc (TDP).",
        link: {
          label: "gov.uk: Tenancy deposit protection",
          url: "https://www.gov.uk/tenancy-deposit-protection",
        },
      },
      {
        id: "d2-viewing",
        type: "pick",
        place: "letting",
        title: "Đi xem nhà cho mùa đông",
        prompt: "Khi xem nhà, kiểm tra những gì?",
        options: [
          { text: "Lò sưởi có chạy không", ok: true },
          { text: "Cửa sổ 2 lớp (double glazing)", ok: true },
          { text: "Góc tường có mốc không", ok: true },
          { text: "EPC từ band C trở lên", ok: true },
          { text: "Màu sơn tường có hợp mệnh", ok: false },
          { text: "Tên wifi có ngầu không", ok: false },
        ],
        explain:
          "Mùa đông Anh dài và tối. Nhà EPC F/G, cửa 1 lớp sẽ rất lạnh và tốn tiền sưởi. Dọn vào thì chụp ảnh mọi hỏng hóc gửi email chủ nhà ngay để giữ cọc.",
      },
      {
        id: "d2-laundry",
        type: "duo",
        place: "laundrette",
        title: "Cùng bạn đồng hành ra tiệm giặt",
        hint: "Đi cùng bạn đồng hành tới Tiệm giặt sấy rồi bấm E.",
        explain:
          "Mẹo phơi đồ mùa đông: máy hút ẩm (tốt nhất), tủ sấy, hoặc tiệm giặt £1–2/30 phút. Vắt thêm 10–15 phút cũng nhanh khô hơn. Phơi trong phòng kín dễ mốc tường.",
      },
    ],
  },
  {
    day: 3,
    title: "Giấy tờ & ngân hàng",
    icon: "🏦",
    unlock: "Mở khoá: Cùng thành phố 📍",
    quests: [
      {
        id: "d3-banks",
        type: "quiz",
        place: "bank",
        title: "Chọn ngân hàng đầu tiên",
        question:
          "Vì sao sinh viên mới sang hay không mở được Student Account tốt nhất của một số ngân hàng lớn?",
        options: [
          "Vì phải có bằng lái xe UK",
          "Vì yêu cầu đã sống ở Anh khoảng 3 năm",
          "Vì chỉ dành cho người trên 30 tuổi",
          "Vì phải nạp sẵn £1.000",
        ],
        answer: 1,
        explain:
          "Lời khuyên cộng đồng: dùng cả hai, một ngân hàng số (Monzo, Chase) để tiêu hằng ngày và một ngân hàng truyền thống (nhiều bạn chọn Lloyds) để nhận lương, làm giấy tờ.",
      },
      {
        id: "d3-digital",
        type: "order",
        place: "bank",
        title: "Mở ngân hàng số đúng thứ tự",
        prompt: "Sắp xếp các bước để mở Monzo/Chase:",
        steps: [
          "Sang tới UK",
          "Có địa chỉ ở (tạm thời cũng được)",
          "Kích hoạt SIM UK",
          "Tải app và đăng ký bằng hộ chiếu",
        ],
        explain:
          "Không mở được từ Việt Nam đâu. Chuyển tiền về nhà thì so sánh Wise, Remitly, Revolut. Lưu ý: tiền trong Revolut không được FSCS bảo vệ như ngân hàng truyền thống.",
      },
      {
        id: "d3-ask",
        type: "chat",
        title: "Hỏi bạn đồng hành dùng ngân hàng nào",
        hint: "Mở chat với bạn đồng hành (nút 🤝) và gửi một tin nhắn.",
        explain: "Hỏi người đi trước luôn nhanh hơn tự mò. Đừng bao giờ gửi số thẻ hay mã OTP cho ai nhé.",
      },
    ],
  },
  {
    day: 4,
    title: "Đi lại",
    icon: "🚆",
    unlock: "Mở khoá: Chùa Cầu Duyên 🏮",
    quests: [
      {
        id: "d4-oyster",
        type: "quiz",
        place: "station",
        title: "Hiểu đúng thẻ Student Oyster",
        question: "18+ Student Oyster giảm giá cho loại vé nào?",
        options: ["Mọi chuyến đi lẻ", "Vé tháng/năm (giảm 30%)", "Chỉ xe buýt", "Chỉ vé máy bay"],
        answer: 1,
        explain: "Giảm vé lẻ ngoài giờ cao điểm là nhờ 16-25 Railcard. Hầu hết sinh viên làm cả hai.",
        link: {
          label: "TfL: 18+ Student Oyster",
          url: "https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-oyster-photocard",
        },
      },
      {
        id: "d4-link",
        type: "order",
        place: "station",
        title: "Gắn Railcard vào Oyster",
        prompt: "Sắp xếp để được giảm 1/3 vé lẻ ngoài giờ cao điểm ở London:",
        steps: [
          "Mua thẻ Oyster vật lý",
          "Mang cả Oyster và Railcard ra ga tàu điện",
          "Nhờ nhân viên ga liên kết hai thẻ",
          "Quẹt Oyster khi đi ngoài giờ cao điểm",
        ],
        explain:
          "Hiện chưa gắn được Railcard vào thẻ contactless/Apple Pay, phải dùng Oyster vật lý. Và nhớ: đi bộ 20 phút ở Anh là “gần” đó!",
      },
      {
        id: "d4-ride",
        type: "duo",
        place: "busstop",
        title: "Cùng bạn đồng hành lên Oii-Bus",
        hint: "Đi cùng bạn đồng hành tới Bến Oii-Bus rồi bấm E.",
        explain: "Railcard hoà vốn chỉ sau vài chuyến (Brighton, Oxford…). Cuối tuần rủ nhau đi chơi đi!",
      },
    ],
  },
  {
    day: 5,
    title: "Ăn uống & săn sale",
    icon: "🛒",
    unlock: "Huy hiệu: Thợ săn tem vàng 🟨",
    quests: [
      {
        id: "d5-yellow",
        type: "pick",
        place: "supermarket",
        title: "Săn tem vàng cuối ngày",
        prompt: "Kệ hàng lúc 8 giờ tối. Chọn tất cả món đang dán tem vàng:",
        options: [
          { text: "Ức gà", ok: true, tag: "£1.20" },
          { text: "Bánh mì gối", ok: false, tag: "£1.35" },
          { text: "Cá hồi", ok: true, tag: "£1.80" },
          { text: "Sữa", ok: false, tag: "£1.55" },
          { text: "Rau trộn", ok: true, tag: "25p" },
          { text: "Táo", ok: false, tag: "£2.10" },
        ],
        explain:
          "Mua về chia nhỏ, trữ tủ đá ăn dần. Siêu thị rẻ: Lidl, Aldi, Iceland. Tải app Clubcard/Lidl Plus. Too Good To Go bán túi đồ ăn cuối ngày giá rẻ, Olio có đồ miễn phí.",
      },
      {
        id: "d5-pork",
        type: "order",
        place: "asian",
        title: "Sơ chế thịt cho hết mùi",
        prompt: "Sắp xếp các bước khử mùi thịt lợn mua ở siêu thị:",
        steps: [
          "Rửa kỹ với muối, chanh hoặc giấm",
          "Cho vào nồi nước LẠNH với gừng, hành",
          "Đun sôi cho bọt bẩn nổi lên hết",
          "Vớt ra rửa lại rồi mới chế biến",
        ],
        explain:
          "Thịt ngon hơn: dòng cao cấp ở siêu thị, tiệm butcher, chợ Ba Lan hoặc siêu thị châu Á. Không biết nấu thì học vài món “tủ” để đỡ tốn tiền.",
      },
      {
        id: "d5-hotpot",
        type: "duo",
        place: "asian",
        title: "Cùng bạn đồng hành mua đồ nấu lẩu",
        hint: "Đi cùng bạn đồng hành tới Tạp hoá châu Á rồi bấm E.",
        explain: "Nấu chung, chia tiền: vừa rẻ vừa vui. Lẩu cuối tuần là “đặc sản” của du học sinh Việt.",
      },
    ],
  },
  {
    day: 6,
    title: "Sức khoẻ & mùa đông",
    icon: "🩺",
    unlock: "Huy hiệu: Sống khoẻ ở Anh 💪",
    quests: [
      {
        id: "d6-gp",
        type: "quiz",
        place: "gp",
        title: "Đăng ký bác sĩ gia đình",
        question: "Khi nào nên đăng ký GP?",
        options: [
          "Đợi khi ốm hẵng đăng ký",
          "Ngay khi đến, kể cả lúc đang khoẻ",
          "Không cần, ra viện là được",
          "Chỉ khi mua bảo hiểm riêng",
        ],
        answer: 1,
        explain:
          "GP miễn phí và là “cửa ngõ” tới dịch vụ NHS. Khám răng thì vẫn mất phí (NHS rẻ hơn tư). Khẩn cấp gọi 999, cần tư vấn gọi 111.",
        link: {
          label: "NHS: đăng ký GP",
          url: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
        },
      },
      {
        id: "d6-skin",
        type: "pick",
        place: "pharmacy",
        title: "Trị da khô vì nước cứng",
        prompt: "Mới sang bị ngứa, khô da. Nên làm gì?",
        options: [
          { text: "Lắp đầu lọc vòi sen", ok: true },
          { text: "Dùng kem dưỡng cho da nhạy cảm (Cetraben, Aveeno…)", ok: true },
          { text: "Hỏi dược sĩ (miễn phí)", ok: true },
          { text: "Tắm nước thật nóng thật lâu", ok: false },
          { text: "Kệ, tự khỏi", ok: false },
        ],
        explain:
          "Nước cứng làm khô da và tóc. Bình lọc (Brita) để rửa mặt cũng giúp nhiều. Nặng thì đi GP để được kê đơn.",
      },
      {
        id: "d6-wave",
        type: "wave",
        title: "Chào 3 người trên phố",
        hint: "Đứng gần mọi người và bấm 👋 (hoặc phím 1). Mùa đông tối từ 4 giờ chiều, có bạn bè là đỡ buồn hẳn.",
        explain:
          "Mùa đông thiếu nắng dễ buồn (SAD). Ra ngoài lúc trời sáng, bổ sung Vitamin D, và giữ liên lạc với mọi người.",
      },
    ],
  },
  {
    day: 7,
    title: "Việc làm & kết nối",
    icon: "💼",
    unlock: "Huy hiệu: Tân sinh viên tốt nghiệp khoá nhập môn 🎓",
    quests: [
      {
        id: "d7-work",
        type: "quiz",
        place: "cafe",
        title: "Đi làm thêm đúng luật",
        question: "Visa sinh viên đại học thường cho làm tối đa bao nhiêu giờ/tuần trong kỳ học?",
        options: ["10 giờ", "20 giờ", "40 giờ", "Không giới hạn nếu trả tiền mặt"],
        answer: 1,
        explain:
          "Phải có số NI (xin sớm trên gov.uk), lương ít nhất bằng lương tối thiểu (tăng mỗi tháng 4) và trả qua tài khoản ngân hàng. Không được làm freelance.",
        link: { label: "gov.uk: Student visa", url: "https://www.gov.uk/student-visa" },
      },
      {
        id: "d7-scam",
        type: "quiz",
        place: "cafe",
        title: "Cuộc gọi “Home Office”",
        question:
          "Có người gọi xưng là Home Office, nói visa bạn có vấn đề và đòi nộp phạt ngay. Bạn làm gì?",
        options: [
          "Chuyển tiền cho nhanh",
          "Cúp máy, không đưa thông tin, báo phòng hỗ trợ sinh viên quốc tế",
          "Mua thẻ quà tặng iTunes theo yêu cầu",
          "Đọc số thẻ ngân hàng để họ kiểm tra",
        ],
        answer: 1,
        explain:
          "Home Office không bao giờ gọi điện đòi tiền phạt. Cẩn thận cả việc làm “dễ kiếm tiền” qua WhatsApp và nhờ nhận tiền hộ vào tài khoản (money mule, phạm pháp).",
        link: {
          label: "gov.uk: lừa đảo giả danh Home Office",
          url: "https://www.gov.uk/government/publications/frauds-tricks-and-scams/fraud-tricks-and-scams",
        },
      },
      {
        id: "d7-duyen",
        type: "duyen",
        title: "Xin một quẻ se duyên",
        hint: "Xuống Chùa Cầu Duyên, xin quẻ ở miếu Ông Tơ Bà Nguyệt và trò chuyện với người được ghép.",
        explain:
          "Một tuần đầu xong rồi! Kết nối thật mới là thứ giữ mình ở lại. Chúc bạn có nhiều bạn mới (và biết đâu, một nửa).",
      },
    ],
  },
];

export const viHandbook = {
  title: "📘 Cẩm nang tân sinh viên",
  today: (day: number, title: string) => `Ngày ${day}: ${title}`,
  progress: (n: number) => `${n}/3 hôm nay`,
  go: "Đi tới",
  doIt: "Làm ngay",
  done: "Xong",
  waiting: (date: string) => `Ngày tiếp theo mở lúc 00:00 (${date}, giờ London). Hẹn mai nhé!`,
  finished: "🎓 Bạn đã xong cẩm nang 7 ngày! Giờ là tiền bối rồi.",
  chapterDone: (day: number, unlock: string) => `🎉 Xong Ngày ${day}! ${unlock}`,
  questDone: (title: string) => `✅ ${title}`,
  devSkip: "⏩ Bản thử: mở ngày tiếp theo ngay",
  locked: (day: number) => `🔒 Mở sau khi xong Ngày ${day} trong Cẩm nang`,
  needBuddy: "Cần bạn đồng hành đi cùng! Ra Freshers' Fair ghép bạn trước nhé.",
  buddyFar: (name: string) => `Đợi ${name} đi tới đã (đứng gần nhau rồi bấm E).`,
  wrong: "Chưa đúng, thử lại nhé!",
  orderHint: "Bấm lần lượt theo đúng thứ tự.",
  pickHint: "Chọn hết các ý đúng rồi bấm Kiểm tra.",
  check: "Kiểm tra",
  reset: "Làm lại",
  learnMore: "Xem thêm",
  close: "Đóng",
  qaTitle: "Hỏi đáp",
  qaIntro: "Kinh nghiệm thật từ đàn anh đàn chị.",
  mainAction: (n: number) => `📘 Nhiệm vụ hôm nay · ${n}/3`,
  visit: (place: string) => `Ghé ${place}`,
  marker: "Nhiệm vụ ở đây",
};

export type TopicId = "pre" | "bank" | "sim" | "travel" | "home" | "work" | "food" | "fun" | "health";

export const TOPICS: Record<TopicId, string> = {
  pre: "✈️ Trước khi bay",
  sim: "📱 SIM điện thoại",
  bank: "🏦 Ngân hàng",
  travel: "🚆 Đi lại",
  home: "🏠 Nhà cửa",
  work: "💼 Công việc",
  food: "🛒 Ăn uống & mua sắm",
  fun: "🎡 Giải trí",
  health: "🩺 Y tế",
};

/** Ngân hàng hỏi–đáp (từ sheet "Bank câu hỏi", đã rút gọn chút ít). */
export const QA: { topic: TopicId; q: string; a: string }[] = [
  {
    topic: "pre",
    q: "Mang theo £2.000 tiền mặt có ổn không?",
    a: "Hợp pháp (dưới £10.000 không cần khai báo) nhưng không an toàn. Chỉ nên mang £300–500, còn lại để trong thẻ thanh toán quốc tế.",
  },
  {
    topic: "pre",
    q: "Hành lý xách tay cần giấy tờ gì?",
    a: "Folder “bất ly thân”: hộ chiếu có visa, thư quyết định cấp visa, offer letter và thư CAS. Nên in hết ra, in cả eVisa/share code cho lúc check-in ở Việt Nam.",
  },
  {
    topic: "pre",
    q: "Có vật dụng “bí mật” nào nên mang?",
    a: "Đầu lọc nước gắn vòi sen (chống rụng tóc do nước cứng) và ít đồ ăn vặt Việt Nam: vừa đỡ nhớ nhà, vừa là “công cụ ngoại giao” kết bạn.",
  },
  {
    topic: "pre",
    q: "Dùng app thời tiết nào cho chuẩn?",
    a: "Met Office. App mặc định trên điện thoại ở UK thường không chính xác.",
  },
  { topic: "pre", q: "Có nên mang ô từ Việt Nam?", a: "Rất nên. Ô ở UK thường yếu, không chịu được gió to." },
  {
    topic: "pre",
    q: "Mùa đông ở UK đáng lưu ý nhất là gì?",
    a: "Bóng tối: trời tối từ 3:30–4:00 chiều, dễ “trầm cảm theo mùa” (SAD). Chuẩn bị tinh thần và bổ sung Vitamin D.",
  },
  {
    topic: "pre",
    q: "Văn hoá qua đường ở UK?",
    a: "Ở vạch zebra, người đi bộ được ưu tiên tuyệt đối: cứ bước xuống, xe sẽ dừng.",
  },
  {
    topic: "pre",
    q: "Người Anh có thân thiện không?",
    a: "Rất lịch sự nhưng xa cách: luôn nói “sorry” với người lạ, nhưng khó kết bạn sâu. Đặt kỳ vọng thực tế.",
  },
  {
    topic: "pre",
    q: "Giờ mua sắm ở UK thế nào?",
    a: "Cửa hàng quần áo đóng 5–6 giờ chiều, siêu thị 9–10 giờ tối. Chủ nhật chỉ mở ngắn (ví dụ 10:00–16:00).",
  },
  {
    topic: "pre",
    q: "Không biết nấu ăn thì sao?",
    a: "Sẽ rất tốn kém: đồ Á ăn ngoài đắt và không chuẩn vị. Học vài món “tủ” trước khi bay.",
  },
  {
    topic: "pre",
    q: "Nhận email “unable to make a decision” khi xin visa?",
    a: "Khá “hên xui”: có bạn vài ngày sau có visa, có bạn phải bổ sung hoặc phỏng vấn. Đừng hoang mang, chuẩn bị tinh thần cho phỏng vấn (vì sao chọn UK/trường/ngành, tài chính, kế hoạch sau tốt nghiệp).",
  },
  {
    topic: "sim",
    q: "Vừa hạ cánh, làm sao có SIM?",
    a: "Ra sảnh Arrivals tìm máy bán SIM hoặc quầy Lyca/Lebara, mua SIM trả trước để có mạng ngay. Gói không ưu đãi lắm nên chỉ dùng ngắn hạn.",
  },
  {
    topic: "sim",
    q: "Có nên giữ SIM Việt Nam?",
    a: "Chắc chắn nên: để nhận OTP ngân hàng ở nhà. Chuyển gói rẻ nhất, đăng ký chuyển vùng chỉ nhận SMS trước khi bay.",
  },
  {
    topic: "sim",
    q: "Nên chọn nhà mạng nào?",
    a: "Phổ biến: Lebara, Voxi, Giffgaff, Smarty, EE. Lebara, Voxi và Smarty được đánh giá hợp lý nhất. EE khá đắt.",
  },
  {
    topic: "sim",
    q: "Lướt mạng xã hội nhiều thì chọn gì?",
    a: "Voxi: không tính data cho mạng xã hội, kèm quà hằng tháng (Voxi Drops) và vé xem phim ưu đãi.",
  },
  {
    topic: "sim",
    q: "Có SIM miễn phí không?",
    a: "Có: nhiều bạn nhận SIM Lebara miễn phí lúc lấy visa ở Việt Nam. Giffgaff hay phát miễn phí ở sân bay hoặc Freshers' Week.",
  },
  {
    topic: "bank",
    q: "Mới sang nên mở ngân hàng nào?",
    a: "Dùng cả hai: một ngân hàng số (Monzo) cho chi tiêu hằng ngày và một ngân hàng truyền thống (Lloyds) để nhận lương, làm giấy tờ.",
  },
  {
    topic: "bank",
    q: "Sao cộng đồng hay dùng Lloyds?",
    a: "Thủ tục được “truyền miệng” là thân thiện, linh hoạt nhất cho người mới. Với người mới sang, dễ và yên tâm quan trọng hơn tiết kiệm vài bảng phí.",
  },
  {
    topic: "bank",
    q: "Mở tài khoản “miễn phí nhận tiền” (Santander/Nationwide) được không?",
    a: "Chỉ khi chắc chắn không bao giờ gửi tiền về Việt Nam: phí gửi tiền có thể tới £25/lần.",
  },
  {
    topic: "bank",
    q: "Mở ngân hàng cần giấy tờ gì?",
    a: "Thường là hộ chiếu, eVisa và giấy chứng minh địa chỉ (xin thư xác nhận từ trường). Nhiều nơi giờ chỉ cần hộ chiếu.",
  },
  {
    topic: "bank",
    q: "Chưa có tài khoản UK thì tiêu tiền thế nào?",
    a: "Dùng tạm thẻ quốc tế của ngân hàng Việt Nam, chịu phí chuyển đổi ngoại tệ.",
  },
  {
    topic: "bank",
    q: "Chuyển tiền về Việt Nam dùng gì?",
    a: "Wise, Remitly, Revolut… So sánh phí và tỉ giá trước khi chuyển.",
  },
  {
    topic: "bank",
    q: "Revolut có an toàn như ngân hàng không?",
    a: "Revolut ở UK dùng giấy phép tiền điện tử nên không được FSCS bảo vệ: nếu phá sản, tiền trong tài khoản không được đền bù như ngân hàng truyền thống.",
  },
  {
    topic: "bank",
    q: "Có nên mua vàng ở UK để tích sản?",
    a: "Không nên: gửi tiền về nhờ người nhà mua ở Việt Nam dễ mua bán hơn. Mang vàng UK về Việt Nam bán thường bị ép giá.",
  },
  {
    topic: "bank",
    q: "Nếu vẫn muốn mua vàng ở UK?",
    a: "Royal Mint (uy tín), Costco, hoặc tiệm bullion ở Jewellery Quarter (Birmingham). Xu legal tender (như Britannia) được miễn thuế lãi vốn (CGT); vàng miếng có lãi trên mức miễn thuế thì phải đóng.",
  },
  {
    topic: "travel",
    q: "Mua thẻ Oyster thế nào?",
    a: "Mua ở ga Tube, hoặc dùng luôn thẻ contactless/Apple Pay (giá như nhau). Thẻ 18+ Student Oyster thì đăng ký trên web TfL.",
  },
  {
    topic: "travel",
    q: "Nên làm thẻ nào để tiết kiệm?",
    a: "Cả hai: 18+ Student Oyster (giảm 30% vé tháng/năm) và 16-25 Railcard (giảm 1/3 vé tàu toàn UK + vé lẻ ngoài giờ cao điểm ở London khi gắn vào Oyster).",
  },
  {
    topic: "travel",
    q: "Ở London 1 năm có đáng mua Railcard?",
    a: "Rất đáng: vài chuyến ra Brighton, Oxford là hoà vốn, lại giảm vé lẻ ngoài giờ cao điểm trong London.",
  },
  {
    topic: "travel",
    q: "Đi bộ 20 phút là “gần” thật à?",
    a: "Thật đó! Ở Anh ai cũng coi 20 phút đi bộ là gần. Đầu tư một đôi giày êm, ấm.",
  },
  {
    topic: "home",
    q: "Ở ký túc xá có phải rẻ nhất?",
    a: "Không hẳn, nhất là ở London. Thuê chung căn hộ với các bạn để chia tiền nhà và hoá đơn thường tiết kiệm hơn.",
  },
  {
    topic: "home",
    q: "Ở London nên ở khu nào?",
    a: "Tránh khu rất đắt (Kensington, Chelsea, Mayfair, Hampstead, Richmond). Ưu tiên zone 2: rẻ hơn mà vẫn tiện; zone 3 xa và thưa hơn nhiều. Nói chung nếu tài chính cho phép: West > North > East > South.",
  },
  {
    topic: "home",
    q: "Tìm nhà trên mạng sao cho khỏi bị lừa?",
    a: "Tuyệt đối không chuyển cọc khi chưa xem nhà trực tiếp (hoặc video call thấy rõ người và phòng). Ai hối thúc chuyển tiền vì “ở xa” là dấu hiệu lừa đảo.",
  },
  {
    topic: "home",
    q: "Mùa đông phơi đồ không khô?",
    a: "Máy hút ẩm (tốt nhất), tủ sấy (£60–70, 2–3 tiếng) hoặc tiệm giặt £1–2/30 phút. Mẹo miễn phí: đặt giá phơi cạnh lò sưởi, trùm ga giường thành “lồng sấy”.",
  },
  {
    topic: "home",
    q: "Tính ngân sách thuê nhà thế nào?",
    a: "Tiền thuê + bills (điện, nước, gas, internet) + council tax. Sinh viên toàn thời gian được miễn council tax nhưng phải tự đăng ký.",
  },
  {
    topic: "home",
    q: "Tiền cọc tối đa bao nhiêu?",
    a: "Tối đa 5 tuần tiền thuê, và chủ nhà phải gửi vào chương trình bảo vệ cọc của nhà nước (TDP).",
  },
  {
    topic: "home",
    q: "Mẹo để không mất cọc khi chuyển đi?",
    a: "Ngay khi dọn vào, chụp ảnh và quay video mọi vết bẩn, hỏng hóc, gửi email cho chủ nhà/agent để làm bằng chứng.",
  },
  {
    topic: "home",
    q: "Hợp đồng thuê nhà cần để ý gì?",
    a: "Đọc kỹ điều khoản chấm dứt sớm (break clause), trách nhiệm sửa chữa, vật nuôi, khách ở lại.",
  },
  {
    topic: "home",
    q: "Làm sao tiết kiệm tiền sưởi?",
    a: "Chọn nhà EPC band C trở lên, cửa sổ 2 lớp. Dùng chăn điện và túi chườm nóng, mặc đồ giữ nhiệt: rẻ hơn bật sưởi cả phòng.",
  },
  {
    topic: "work",
    q: "Chuẩn bị tìm việc từ khi còn ở Việt Nam?",
    a: "Nghiên cứu thị trường việc làm UK và kết nối với người đi trước (hội SVUK, các nhóm tìm việc của cộng đồng).",
  },
  {
    topic: "work",
    q: "CV ở UK khác Việt Nam thế nào?",
    a: "Rất khác: theo format UK, tập trung vào kết quả và từ khoá của ngành. Cover letter phải là câu chuyện ngắn nối điểm mạnh của bạn với yêu cầu công việc.",
  },
  {
    topic: "work",
    q: "Quy trình tuyển dụng có vòng nào lạ?",
    a: "Bài test online (online assessment) và phỏng vấn video ghi hình sẵn. Mỗi công ty một kiểu, nên tìm hiểu trước.",
  },
  {
    topic: "work",
    q: "Nên apply việc từ khi nào?",
    a: "Ngay kỳ đầu: graduate scheme thường mở từ tháng 9–10 cho năm sau.",
  },
  {
    topic: "work",
    q: "Người hướng nội networking thế nào?",
    a: "Bắt đầu nhỏ: xin “coffee chat” online 15 phút với anh chị đi trước trên LinkedIn, đi workshop của trường, kết bạn trong lớp. Chân thành quan trọng hơn hoạt ngôn.",
  },
  {
    topic: "work",
    q: "Số NI là gì, có cần gấp không?",
    a: "Mã số bảo hiểm quốc gia, cần để đi làm hợp pháp. Xin trên GOV.UK ngay tuần đầu vì có thể mất vài tuần.",
  },
  {
    topic: "food",
    q: "Siêu thị nào rẻ nhất?",
    a: "Lidl, Aldi, Iceland. Tải app (Tesco Clubcard, Lidl Plus) để có thêm deal.",
  },
  {
    topic: "food",
    q: "App nào giúp ăn rẻ?",
    a: "Too Good To Go (túi đồ ăn cuối ngày), Olio (đồ miễn phí từ cộng đồng), The Fork (deal nhà hàng). Student Beans, UNiDAYS để giảm giá sinh viên.",
  },
  {
    topic: "food",
    q: "Thịt lợn siêu thị có mùi, phải làm sao?",
    a: "Không phải mình bạn đâu! Chọn dòng cao cấp, tiệm butcher, chợ Ba Lan, siêu thị châu Á, hoặc Costco. Về nhà rửa muối/chanh, trần nước lạnh với gừng, hành rồi mới nấu.",
  },
  {
    topic: "food",
    q: "Thèm bún đậu ở London?",
    a: "Cộng đồng hay nhắc Nón (Highbury), Pho City (Greenwich), Cây Tre (Soho). Nhiều quán chỉ bán vài ngày/tuần, gọi trước cho chắc.",
  },
  {
    topic: "food",
    q: "Mua quần áo ấm mà rẻ?",
    a: "Đồ cũ: charity shop, app Vinted. Đồ mới: Primark (leggings siêu ấm). Đợi sale mua đồ giữ nhiệt Uniqlo.",
  },
  {
    topic: "food",
    q: "Bí kíp đi siêu thị tiết kiệm nhất?",
    a: "Săn tem vàng cuối ngày, mua số lượng lớn khi có offer, so giá theo kg/lít.",
  },
  {
    topic: "fun",
    q: "London đắt, đi chơi sao cho rẻ?",
    a: "Hầu hết bảo tàng lớn, công viên và nhiều triển lãm miễn phí. Dùng UNiDAYS, TOTUM. Sinh viên nên làm Student Art Pass.",
  },
  {
    topic: "health",
    q: "GP là gì, có bắt buộc đăng ký?",
    a: "Bác sĩ gia đình. Phải đăng ký ngay (miễn phí) kể cả khi khoẻ: đây là cửa ngõ tới dịch vụ NHS.",
  },
  {
    topic: "health",
    q: "Khám răng có miễn phí không?",
    a: "Không, kể cả nha sĩ NHS cũng mất phí (rẻ hơn tư). Tìm nha sĩ đang “accepting NHS patients”.",
  },
  {
    topic: "health",
    q: "Mới sang bị ngứa, nổi mẩn?",
    a: "Thường do nước cứng và khí hậu khô: lắp lọc vòi sen, thuốc chống dị ứng, kem dưỡng cho da nhạy cảm (Cetraben, Aveeno, Eucerin 10% Urea).",
  },
  {
    topic: "health",
    q: "Có nên hỏi dược sĩ trước khi đi GP?",
    a: "Nên: dược sĩ ở Boots/Superdrug tư vấn miễn phí và rất giỏi, đôi khi kem mua tại quầy còn rẻ hơn lấy thuốc theo toa.",
  },
  {
    topic: "health",
    q: "Khẩn cấp gọi số nào?",
    a: "999 khi khẩn cấp, 111 khi cần tư vấn y tế. Trường nào cũng có dịch vụ tư vấn tâm lý miễn phí.",
  },
];
