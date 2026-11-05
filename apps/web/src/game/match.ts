import {
  MATCH_SESSION_MINUTES,
  containsUrl,
  pickMatch,
  sanitizeUserText,
  type CityId,
  type Gender,
  type MatchCandidate,
  type Seeking,
} from "@xom-oii/shared";
import { chime } from "../audio/sfx";
import { viTemple } from "../copy/vi";
import { game } from "./state";
import { ui } from "./ui";

/**
 * Se duyên 1:1 — bản thử offline. Thuật toán ghép là hàm thật trong `@xom-oii/shared` (pickMatch),
 * chỉ có "người lạ" là bot. Từ M2: hàng đợi ở Redis, server gọi matchQueue() mỗi giây.
 */
export interface DmMessage {
  id: number;
  from: "me" | "them" | "system";
  text: string;
}

interface Stranger extends MatchCandidate {
  name: string;
  city: CityId;
  lines: string[];
}

const LINES_F = [
  "Hi! Bạn cũng đi Bus Oii à 😄",
  "Mình học ở đây được 1 năm rồi. Bạn năm mấy?",
  "Cuối tuần bạn hay làm gì? Mình hay đi chợ Á mua đồ nấu 🍜",
  "Bạn thắp hương cầu gì đấy, kể đi 😆",
  "Mình thích Lake District nhất, mưa nhưng đẹp.",
  "Nói chuyện vui ghê. Lần sau gặp lại trên xe nhé!",
];
const LINES_M = [
  "Chào bạn! Quẻ này có vẻ tốt đấy 😄",
  "Mình mới sang được mấy tháng, vẫn chưa quen ăn sandwich lạnh.",
  "Bạn ở thành phố nào thế?",
  "Hôm qua mình thử nấu phở, nước dùng hơi… thiếu hồn 😅",
  "Bạn có hay đi thư viện tầng giữa không, nhạc lofi chill lắm.",
  "Vui quá, hẹn gặp lại bạn ở Xóm Oii nhé!",
];

const s = (id: string, name: string, gender: Gender, city: CityId, merit: number): Stranger => ({
  id,
  name,
  gender,
  seeking: "opposite",
  merit,
  waitSec: 0,
  blocked: [],
  recent: [],
  city,
  lines: gender === "female" ? LINES_F : LINES_M,
});

const STRANGERS: Stranger[] = [
  s("st-1", "Mây Hồng", "female", "manchester", 10),
  s("st-2", "Hạt Tiêu", "female", "london", 30),
  s("st-3", "Gấu Bông", "female", "edinburgh", 0),
  s("st-4", "Cà Phê Sữa", "female", "birmingham", 5),
  s("st-5", "Bánh Flan", "male", "leeds", 12),
  s("st-6", "Mì Cay", "male", "london", 25),
  s("st-7", "Đậu Phộng", "male", "bristol", 0),
  s("st-8", "Chè Bưởi", "male", "nottingham", 8),
].map((x) => ({ ...x, seeking: "any" as Seeking })); // bot chấp nhận cả hai, để bản thử luôn ghép được

let seq = 0;
let searchTimer: number | null = null;
let replyTimer: number | null = null;
let partner: Stranger | null = null;
let lineIndex = 0;
const recent: string[] = [];
const blocked: string[] = [];

const msg = (from: DmMessage["from"], text: string): DmMessage => ({ id: ++seq, from, text });

export function meritTotal(): number {
  return Object.values(game.merit.today).reduce((a, b) => a + (b ?? 0), 0);
}

export function startSearch(gender: Gender, seeking: Seeking) {
  const u = ui();
  u.set({ duyen: { ...u.duyen, step: "searching", gender, seeking, messages: [], partner: null } });
  // phúc đức nhiều → đợi ít (bản thật: ưu tiên trong hàng đợi, xem queuePriority)
  const merit = meritTotal();
  const delay = Math.max(1200, 4500 - merit * 60);
  searchTimer = window.setTimeout(() => {
    const me: MatchCandidate = { id: "me", gender, seeking, merit, waitSec: 0, blocked, recent };
    const found = pickMatch(me, STRANGERS, Math.random) as Stranger | null;
    if (!found) {
      ui().set({ duyen: { ...ui().duyen, step: "intro" } });
      return;
    }
    partner = found;
    lineIndex = 0;
    recent.push(found.id);
    if (recent.length > 3) recent.shift();
    chime();
    ui().set({
      duyen: {
        ...ui().duyen,
        step: "chat",
        partner: { name: found.name, city: found.city },
        endsAt: Date.now() + MATCH_SESSION_MINUTES * 60_000,
        messages: [
          msg("system", viTemple.seDuyen.matched(found.name)),
          msg("system", viTemple.seDuyen.safety),
        ],
        typing: false,
      },
    });
    scheduleReply(1800);
  }, delay);
}

export function cancelSearch() {
  if (searchTimer) window.clearTimeout(searchTimer);
  searchTimer = null;
  ui().set({ duyen: { ...ui().duyen, step: "intro" } });
}

function push(m: DmMessage) {
  const d = ui().duyen;
  ui().set({ duyen: { ...d, messages: [...d.messages, m].slice(-60) } });
}

function scheduleReply(ms: number) {
  if (!partner || lineIndex >= partner.lines.length) return;
  ui().set({ duyen: { ...ui().duyen, typing: true } });
  replyTimer = window.setTimeout(() => {
    if (!partner) return;
    ui().set({ duyen: { ...ui().duyen, typing: false } });
    push(msg("them", partner.lines[lineIndex++]!));
  }, ms);
}

/** Gửi tin 1:1: cùng bộ lọc với chat chung (sanitize, chặn link). */
export function sendDm(raw: string): boolean {
  if (ui().duyen.step !== "chat") return false;
  const text = sanitizeUserText(raw);
  if (!text) return false;
  if (containsUrl(text)) {
    ui().showToast("Chưa cho gửi link trong se duyên nhé.");
    return false;
  }
  push(msg("me", text));
  if (replyTimer) window.clearTimeout(replyTimer);
  scheduleReply(1400 + Math.random() * 1600);
  return true;
}

export function endSession(reason: "end" | "block" | "report" | "time") {
  if (replyTimer) window.clearTimeout(replyTimer);
  if (partner && reason === "block") blocked.push(partner.id);
  partner = null;
  const text =
    reason === "block"
      ? viTemple.seDuyen.blocked
      : reason === "report"
        ? viTemple.seDuyen.reported
        : reason === "time"
          ? viTemple.seDuyen.timeUp
          : viTemple.seDuyen.ended;
  const d = ui().duyen;
  ui().set({ duyen: { ...d, step: "ended", typing: false, messages: [...d.messages, msg("system", text)] } });
}
