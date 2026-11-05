/** Copy cho vòng lặp hằng ngày: hồ sơ, chuỗi ngày, thẻ khoe, câu mỗi ngày, Hộ chiếu tân sinh viên. */

export const viDaily = {
  chip: (streak: number, zone: string) => `🔥 ${streak} · ${zone}`,
  profileTitle: "Hồ sơ của bạn",
  tabs: { today: "Hôm nay", newcomer: "Tân sinh viên" },
  streak: "ngày liên tiếp",
  best: (n: number) => `Kỷ lục ${n} ngày`,
  xpToNext: (n: number, zone: string) => `Còn ${n} XP nữa lên ${zone}`,
  maxLevel: "Cấp cao nhất rồi!",
  todayTitle: "Hôm nay bạn đã",
  stats: {
    focus: "phút tập trung",
    incense: "nén hương",
    stamps: "việc hoàn thành",
  },
  quoteTitle: "Câu của hôm nay",
  makeCard: "Tạo thẻ khoe 📸",
  cardTitle: "Thẻ hôm nay",
  cardHint: "Nhấn giữ ảnh để lưu (điện thoại) hoặc bấm Tải ảnh.",
  download: "Tải ảnh",
  copyInvite: "Sao chép link mời",
  copied: "Đã sao chép link mời!",
  copyFailed: "Không sao chép được. Hãy chọn link bên dưới và sao chép tay.",
  inviteNote: "Bạn bè lên xe qua link này, cả hai cùng được thưởng (bản thật).",
  invitedBy: (code: string) => `Bạn được mời lên xe bởi mã ${code} 🎟️`,
  welcomeBack: (n: number, xp: number) => `🔥 Chuỗi ${n} ngày! +${xp} XP`,
  firstDay: (xp: number) => `🎟️ Ngày đầu lên xe! +${xp} XP`,
  streakBroke: "Chuỗi cũ đứt rồi, mình bắt đầu lại nhé 💪",
  levelUp: (zone: string, title: string) => `🎉 Lên ${zone}: ${title}!`,
  xp: (n: number) => `+${n} XP`,
  card: {
    title: "Hôm nay mình đã lên xe",
    days: "ngày liên tiếp",
    cta: "Cùng lên xe tại Oii-Bus",
  },
  newcomer: {
    title: "🛂 Hộ chiếu tân sinh viên",
    intro: "30 ngày đầu ở Anh: làm xong việc nào thì đánh dấu việc đó. Mỗi việc +10 XP.",
    done: (n: number, total: number) => `${n}/${total} việc`,
    complete: "🎉 Xong hộ chiếu tân sinh viên! Bạn đã sẵn sàng sống ở Anh.",
    learnMore: "Xem hướng dẫn",
    disclaimer: "Thông tin tham khảo, có thể thay đổi. Luôn kiểm tra trang chính thức và email của trường.",
  },
} as const;

/** Một câu mỗi ngày, giọng du học sinh, nhẹ nhàng. */
export const DAILY_QUOTES = [
  "Trời Anh mưa thì mình mang ô, chuyện buồn thì mình mang theo bạn.",
  "Không cần giỏi ngay, chỉ cần hôm nay giỏi hơn hôm qua một chút.",
  "Nhớ nhà là chuyện bình thường. Gọi về cho mẹ một cuộc đi.",
  "Deadline nào rồi cũng qua, miễn là mình bắt đầu.",
  "Một cốc trà nóng sửa được khá nhiều thứ.",
  "Ngại hỏi thì cứ hỏi. Người Anh nói “sorry” còn nhiều hơn mình.",
  "Ăn uống đàng hoàng. Meal deal không phải là bữa tối mỗi ngày.",
  "Đi chậm cũng được, miễn là đừng đứng yên.",
  "Hôm nay nắng thì ra ngoài. Ở Anh, nắng không đợi ai.",
  "Bạn không cô đơn đâu, cả xe đang ở đây.",
  "Ngủ đủ giấc cũng là một cách học bài.",
  "Mỗi lần nói tiếng Anh là một lần tiến bộ, kể cả khi nói sai.",
  "Tiết kiệm là tốt, nhưng thỉnh thoảng tự thưởng một cốc trà sữa cũng tốt.",
  "Cách một nửa vòng trái đất, nhưng lòng vẫn gần nhà.",
  "Bị chê thì xem có gì đáng học, phần còn lại nhẹ nhàng buông.",
  "Hôm nay mệt thì nghỉ, mai lại lên xe.",
  "Một lời hỏi thăm có thể làm cả ngày của ai đó tốt hơn.",
  "Đừng so sánh chương 1 của mình với chương 10 của người khác.",
  "Thử một món Anh mới đi. Tệ lắm thì cũng có chuyện để kể.",
  "Kỳ thi qua đi, kỷ niệm thì ở lại.",
] as const;

export interface NewcomerTask {
  id: string;
  icon: string;
  title: string;
  tip: string;
  link?: { label: string; url: string };
}

/** Checklist 30 ngày đầu. Mẹo tổng hợp từ hướng dẫn của các trường và gov.uk (xem docs/WORLD.md). */
export const NEWCOMER_TASKS: readonly NewcomerTask[] = [
  {
    id: "evisa",
    icon: "🛂",
    title: "Kiểm tra eVisa, tạo share code",
    tip: "Đa số bạn mới giờ dùng eVisa (không còn thẻ BRP). Đăng nhập tài khoản UKVI, kiểm tra số hộ chiếu, tạo share code để đưa cho chủ nhà, ngân hàng, nơi làm.",
    link: {
      label: "gov.uk: chứng minh tình trạng visa",
      url: "https://www.gov.uk/view-prove-immigration-status",
    },
  },
  {
    id: "sim",
    icon: "📱",
    title: "Mua SIM UK",
    tip: "Có số UK trước rồi mới mở ngân hàng, đăng ký GP dễ hơn. Gói trả trước giá rẻ mua ở siêu thị là đủ.",
  },
  {
    id: "enrol",
    icon: "🎓",
    title: "Nhập học, lấy thẻ sinh viên",
    tip: "Làm xong enrolment mới xin được thư xác nhận sinh viên (để mở ngân hàng, miễn council tax). Tải sẵn vài bản PDF.",
  },
  {
    id: "bank",
    icon: "🏦",
    title: "Mở tài khoản ngân hàng",
    tip: "Ngân hàng trên app (mở vài ngày) nhanh hơn chi nhánh (có khi mất vài tuần). Chuẩn bị hộ chiếu, share code, thư của trường.",
  },
  {
    id: "gp",
    icon: "🩺",
    title: "Đăng ký bác sĩ gia đình (GP)",
    tip: "Đăng ký ngay khi đến, đừng đợi lúc ốm. Bạn đã trả phí y tế (IHS) cùng visa nên khám GP miễn phí.",
    link: {
      label: "NHS: đăng ký GP",
      url: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
    },
  },
  {
    id: "council-tax",
    icon: "🏠",
    title: "Xin miễn council tax",
    tip: "Sinh viên toàn thời gian được miễn, nhưng không tự động! Ở nhà thuê ngoài thì tải giấy xác nhận của trường gửi cho council, kẻo nhận hoá đơn hàng trăm bảng.",
    link: {
      label: "gov.uk: council tax cho sinh viên",
      url: "https://www.gov.uk/council-tax/discounts-for-full-time-students",
    },
  },
  {
    id: "work-rules",
    icon: "💼",
    title: "Hiểu luật đi làm thêm",
    tip: "Visa sinh viên đại học thường cho làm tối đa 20 giờ/tuần trong kỳ học, không được làm freelance/tự kinh doanh. Lương phải trả qua tài khoản ngân hàng, đúng lương tối thiểu.",
    link: {
      label: "gov.uk: Student visa — được và không được làm gì",
      url: "https://www.gov.uk/student-visa",
    },
  },
  {
    id: "ni-number",
    icon: "🔢",
    title: "Xin số National Insurance (nếu đi làm)",
    tip: "Đăng ký miễn phí trên gov.uk, có thể mất vài tuần. Bạn vẫn được bắt đầu làm khi đang chờ, nếu chứng minh được quyền làm việc.",
    link: { label: "gov.uk: xin số NI", url: "https://www.gov.uk/apply-national-insurance-number" },
  },
  {
    id: "railcard",
    icon: "🚆",
    title: "Làm thẻ 16-25 Railcard",
    tip: "Giảm khoảng 1/3 giá vé tàu, thường hoà vốn sau 1–2 chuyến. Trên 25 tuổi: xem 26-30 Railcard.",
    link: { label: "16-25 Railcard", url: "https://www.16-25railcard.co.uk/" },
  },
  {
    id: "oyster",
    icon: "🚇",
    title: "Ở London? Làm Student Oyster",
    tip: "18+ Student Oyster giảm giá vé tháng/tuần. Gắn Railcard vào Oyster để giảm thêm vé ngoài giờ cao điểm.",
    link: {
      label: "TfL: giảm giá cho sinh viên",
      url: "https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-discount",
    },
  },
  {
    id: "tv-licence",
    icon: "📺",
    title: "Biết khi nào cần TV licence",
    tip: "Chỉ cần nếu xem TV trực tiếp hoặc BBC iPlayer. Không xem thì khai báo không cần, đỡ bị thư nhắc.",
    link: { label: "TV Licensing", url: "https://www.tvlicensing.co.uk/" },
  },
  {
    id: "community",
    icon: "🇻🇳",
    title: "Tìm Hội sinh viên Việt Nam ở trường/thành phố",
    tip: "Gần như trường nào cũng có Vietsoc. Tết, Trung thu, nấu ăn chung: cách nhanh nhất để đỡ nhớ nhà.",
  },
];
