import type { StationId } from "@oii-bus/shared";
import type { ZoneId } from "@oii-bus/world";

/** Copy cho "máy farm": các quầy làm thêm, treo máy, khu trên tầng thượng. */
export const viFarm = {
  stations: {
    pho: {
      place: "Oii Viet",
      title: "Bê phở",
      verb: "Bê một bát",
      unit: "bát phở",
      icon: "🍜",
      helper: "Thuê phụ bếp",
      helperIcon: "🧑‍🍳",
      hint: "Ca tối thứ 6 đông như hội. Bê nhanh, tip nhiều.",
      lines: [
        "Bàn 4 thêm quẩy!",
        "Phở tái chín, ít hành!",
        "Khách Tây hỏi có rau mùi không 🌿",
        "Bê 3 bát một lúc, đỉnh!",
      ],
    },
    nails: {
      place: "OiiNails",
      title: "Làm nails",
      verb: "Làm một bộ",
      unit: "bộ nails",
      icon: "💅",
      helper: "Thêm thợ nails",
      helperIcon: "💁",
      hint: "Gel, đắp bột, vẽ hoa. Khách quen tip £2.",
      lines: [
        "Khách muốn màu nude nhưng 'pop' hơn 🤔",
        "Đắp bột xong, đẹp xỉu!",
        "Thêm đá nhé chị?",
        "Khách khen: “Lovely, darling!”",
      ],
    },
    tea: {
      place: "Oii Tea",
      title: "Lắc trà sữa",
      verb: "Lắc một cốc",
      unit: "cốc trà sữa",
      icon: "🧋",
      helper: "Máy lắc tự động",
      helperIcon: "🤖",
      hint: "Ít đường, nhiều trân châu. Lắc tới khi tay mỏi.",
      lines: ["50% đường, ít đá!", "Thêm pudding!", "Size L cho bạn Tây", "Trân châu vừa nấu xong 🔥"],
    },
    essay: {
      place: "Góc Deadline",
      title: "Gõ essay",
      verb: "Viết một đoạn",
      unit: "đoạn essay",
      icon: "📝",
      helper: "Pha thêm cốc cà phê",
      helperIcon: "☕",
      hint: "Không ra tiền nhưng XP gấp 3. 23:59 là hạn chót.",
      lines: [
        "Harvard referencing 😵",
        "Word count: 2.999/3.000",
        "Turnitin 4%, yên tâm",
        "Ctrl+S, Ctrl+S, Ctrl+S",
      ],
    },
    mo: {
      place: "Chùa Cầu Duyên",
      title: "Gõ mõ",
      verb: "Gõ một tiếng",
      unit: "tiếng mõ",
      icon: "🪵",
      helper: "Máy gõ mõ tự động",
      helperIcon: "⚙️",
      hint: "Mỗi tiếng mõ +1 công đức. Công đức nhiều, Ông Tơ ưu tiên se duyên.",
      lines: ["Cốc… cốc… cốc…", "Tâm tịnh, duyên tới", "+1 công đức 🪷", "Nam mô… deadline qua mau"],
    },
  } satisfies Record<StationId, unknown>,

  zones: {
    temple: { name: "Chùa Cầu Duyên", icon: "🏮" },
    deadline: { name: "Góc Deadline", icon: "📝" },
    nails: { name: "OiiNails", icon: "💅" },
    plaza: { name: "Quảng trường OiiMate", icon: "⭐" },
    viet: { name: "Oii Viet", icon: "🍜" },
    tea: { name: "Oii Tea", icon: "🧋" },
    front: { name: "Mũi xe", icon: "📸" },
  } satisfies Record<ZoneId, { name: string; icon: string }>,

  done: (n: number) => `Đã làm ${n.toLocaleString("vi-VN")}`,
  next: (m: number) => `mốc tiếp: ${m.toLocaleString("vi-VN")}`,
  perSec: (r: number) => `${r.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}/giây`,
  owned: (n: number) => `đang có ${n}`,
  hire: (cost: number) => `Thuê · £${cost.toLocaleString("vi-VN")}`,
  broke: (cost: number) => `Cần £${cost.toLocaleString("vi-VN")}. Làm thêm vài lượt nữa nhé!`,
  hired: (name: string) => `${name}: đã thuê! Quầy tự chạy kể cả khi bạn tắt app.`,
  holdHint: "Bấm liên tục hoặc giữ nút để làm nhanh. Bàn phím: Space.",
  tooFast: "Từ từ thôi, tay sắp chuột rút rồi 😅",
  milestone: (n: number, unit: string) => `🏆 Đã ${n.toLocaleString("vi-VN")} ${unit}! +XP thưởng`,
  autoOff: "Chưa có ai giúp. Thuê một người để quầy tự chạy.",
  goWork: "Làm việc",

  afk: {
    button: "Treo máy",
    title: "Đang treo máy",
    body: "Màn hình tối để đỡ tốn pin. Các quầy vẫn chạy, nhanh gấp đôi khi bạn treo máy.",
    selfWork: (unit: string) => `Bạn tự làm thêm 1 ${unit}/giây`,
    rate: (r: number) => `⚙️ ${r.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} việc/giây`,
    session: "Từ lúc treo máy",
    wake: "Thức dậy",
    offline: "Đóng app vẫn được tính bù, tối đa 12 tiếng (với các quầy đã thuê người).",
    statue: "Máy farm công đức: treo máy ở đây 😴",
  },

  away: {
    title: "Trong lúc bạn đi vắng…",
    duration: (ms: number) => {
      const m = Math.floor(ms / 60_000);
      const h = Math.floor(m / 60);
      return h > 0 ? `${h} giờ ${m % 60} phút` : `${m} phút`;
    },
    body: "Các bạn giúp việc đã làm:",
    earned: (pay: number, xp: number, merit: number) =>
      `+£${pay.toLocaleString("vi-VN")} · +${xp.toLocaleString("vi-VN")} XP${merit ? ` · +${merit.toLocaleString("vi-VN")} công đức` : ""}`,
    ok: "Tuyệt! 🎉",
  },

  stats: "Tổng",
  wallet: "Ví",
  merit: "Công đức",
} as const;
