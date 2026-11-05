import {
  XP,
  chapterState,
  chaptersCompleted,
  londonDayKey,
  pickMatch,
  sanitizeUserText,
  containsUrl,
  type ChapterState,
  type MatchCandidate,
} from "@oii-bus/shared";
import { SCENES, resolveCollisions, type SceneId } from "@oii-bus/world";
import { create } from "zustand";
import { chime } from "../audio/sfx";
import { CHAPTERS, viHandbook, type Quest } from "../copy/handbook";
import { bump, gainXp } from "./progress";
import { game, type AvatarAnim } from "./state";
import { ui } from "./ui";

/**
 * Cẩm nang tân sinh viên: chương theo ngày, 3 nhiệm vụ/ngày, mở khoá tầng, bạn đồng hành.
 * Bản thử: lưu trong trình duyệt; bạn đồng hành là bot. Từ M2/M3: server giữ tiến độ và ghép người thật.
 */
const QUEST_IDS = CHAPTERS.map((c) => c.quests.map((q) => q.id));
const KEY = "oii-bus:handbook";

export interface Buddy {
  id: string;
  name: string;
  color: string;
  hat: "none" | "non-la" | "beanie" | "grad-cap" | "cat-ears" | "headphones";
  uni: string;
}

export interface BuddyMsg {
  id: number;
  from: "me" | "them" | "system";
  text: string;
}

export interface HandbookState {
  done: string[];
  chapterDoneOn: string[];
  buddy: Buddy | null;
  chat: BuddyMsg[];
  /** UI */
  open: boolean;
  quest: Quest | null;
  chatOpen: boolean;
  matching: boolean;
  set: (p: Partial<HandbookState>) => void;
}

type Saved = Pick<HandbookState, "done" | "chapterDoneOn" | "buddy" | "chat">;

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
const saved = load();

/** `?unlock=all`: mở hết tầng (kiểm thử / demo). */
const UNLOCK_ALL = (() => {
  try {
    return new URLSearchParams(location.search).get("unlock") === "all";
  } catch {
    return false;
  }
})();

export const useHandbook = create<HandbookState>((set) => ({
  done: saved?.done ?? [],
  chapterDoneOn: saved?.chapterDoneOn ?? [],
  buddy: saved?.buddy ?? null,
  chat: saved?.chat ?? [],
  open: false,
  quest: null,
  chatOpen: false,
  matching: false,
  set: (p) => set(p),
}));

useHandbook.subscribe((s) => {
  try {
    const { done, chapterDoneOn, buddy, chat } = s;
    localStorage.setItem(KEY, JSON.stringify({ done, chapterDoneOn, buddy, chat: chat.slice(-40) }));
  } catch {
    /* bỏ qua */
  }
});

const hb = () => useHandbook.getState();

export function currentState(): ChapterState {
  return chapterState(QUEST_IDS, { done: hb().done, chapterDoneOn: hb().chapterDoneOn }, londonDayKey());
}

export function completedChapters(): number {
  return chaptersCompleted(QUEST_IDS, hb().done);
}

/** Tầng nào cần xong bao nhiêu ngày. */
export const FLOOR_UNLOCK: Record<SceneId, number> = { street: 0, bus: 1, library: 2, temple: 4 };
export const CITY_UNLOCK = 3;

export function floorUnlocked(scene: SceneId): boolean {
  return UNLOCK_ALL || completedChapters() >= FLOOR_UNLOCK[scene];
}
export function cityUnlocked(): boolean {
  return UNLOCK_ALL || completedChapters() >= CITY_UNLOCK;
}

/** Nhiệm vụ đang mở (của chương hiện tại) và chưa xong. */
export function activeQuests(): Quest[] {
  const st = currentState();
  if (st.kind !== "active") return [];
  return CHAPTERS[st.chapter]!.quests;
}

export function isDone(id: string): boolean {
  return hb().done.includes(id);
}

/** Nhiệm vụ đang mở chờ ở một địa điểm. */
export function questAt(place: string): Quest | null {
  return activeQuests().find((q) => q.place === place && !isDone(q.id)) ?? null;
}

export function completeQuest(id: string) {
  if (isDone(id)) return;
  const st = currentState();
  const q = CHAPTERS.flatMap((c) => c.quests).find((x) => x.id === id);
  if (!q || st.kind !== "active" || !CHAPTERS[st.chapter]!.quests.some((x) => x.id === id)) return;
  const done = [...hb().done, id];
  hb().set({ done });
  gainXp(XP.newcomerTask);
  bump("done");
  chime();
  ui().showToast(viHandbook.questDone(q.title));
  const ch = CHAPTERS[st.chapter]!;
  if (ch.quests.every((x) => done.includes(x.id))) {
    hb().set({ chapterDoneOn: [...hb().chapterDoneOn.slice(0, st.chapter), londonDayKey()] });
    gainXp(30);
    setTimeout(() => ui().showToast(viHandbook.chapterDone(ch.day, ch.unlock)), 1600);
  }
  buddyCheer();
}

/** Bản thử: không đợi tới mai, mở ngày tiếp theo ngay (lùi ngày hoàn thành chương trước về hôm qua). */
export function devSkipWait() {
  const st = currentState();
  if (st.kind !== "waiting") return;
  const y = new Date(Date.now() - 86_400_000);
  const days = [...hb().chapterDoneOn];
  days[st.chapter - 1] = londonDayKey(y);
  hb().set({ chapterDoneOn: days });
}

// ------------------------------------------------------------- bạn đồng hành ---
const BUDDIES: (Buddy & { lines: string[] })[] = [
  {
    id: "b-ngan",
    name: "Ngân",
    color: "#f6c6cf",
    hat: "beanie",
    uni: "UCL",
    lines: [
      "Mình cũng mới sang tuần này, hơi run 😅",
      "Bạn đã mua SIM chưa? Mình mua Lebara rồi.",
      "Hôm nay làm xong nhiệm vụ chưa? Mình còn 1 cái!",
      "Tối nay nấu mì tôm không, mình có trứng 🥚",
    ],
  },
  {
    id: "b-duc",
    name: "Đức",
    color: "#a8d3d9",
    hat: "grad-cap",
    uni: "Manchester",
    lines: [
      "Chào đồng hành! Cùng cố gắng nha 💪",
      "Mình vừa mở Monzo, nhanh thật.",
      "Trời tối 4 giờ chiều là thật đấy 😂",
      "Cuối tuần đi Railcard ra biển không?",
    ],
  },
  {
    id: "b-thu",
    name: "Thư",
    color: "#fde3a0",
    hat: "non-la",
    uni: "Leeds",
    lines: [
      "Hi! Mình học Marketing, còn bạn?",
      "Nhớ nhà quá, gọi về cho mẹ rồi mà vẫn nhớ 🥲",
      "Phơi đồ mãi không khô, mai ra tiệm giặt cùng nhé!",
      "Bạn thử săn tem vàng chưa? Hôm qua mình mua cá hồi £1.80!",
    ],
  },
  {
    id: "b-khang",
    name: "Khang",
    color: "#c5e3d3",
    hat: "headphones",
    uni: "Birmingham",
    lines: [
      "Yo! Rảnh thì xuống thư viện tập trung cùng không?",
      "Mình đang tìm việc part-time, nhớ là tối đa 20h/tuần nhé.",
      "Có ai gọi xưng Home Office đòi tiền thì cúp máy luôn nha!",
      "Mai làm nhiệm vụ sớm để giữ chuỗi 🔥",
    ],
  },
];

let msgSeq = 0;
let lineIdx = 0;

/** Ghép bạn đồng hành ngẫu nhiên (cùng thuật toán với se duyên, chế độ "ai cũng được"). */
export function matchBuddy() {
  if (hb().buddy || hb().matching) return;
  hb().set({ matching: true });
  setTimeout(() => {
    const me: MatchCandidate = {
      id: "me",
      gender: "male",
      seeking: "any",
      merit: 0,
      waitSec: 0,
      blocked: [],
      recent: [],
    };
    const pool: MatchCandidate[] = BUDDIES.map((b, i) => ({
      id: b.id,
      gender: i % 2 ? "male" : "female",
      seeking: "any",
      merit: 0,
      waitSec: 0,
      blocked: [],
      recent: [],
    }));
    const pick = pickMatch(me, pool, Math.random);
    const b = BUDDIES.find((x) => x.id === pick?.id) ?? BUDDIES[0]!;
    const { lines: _lines, ...buddy } = b;
    hb().set({
      buddy,
      matching: false,
      chat: [
        {
          id: ++msgSeq,
          from: "system" as const,
          text: `🤝 Bạn được ghép với ${b.name} (${b.uni}). Từ giờ hai bạn làm nhiệm vụ cùng nhau!`,
        },
      ],
    });
    placeBuddyNearPlayer();
    chime();
    ui().showToast(`🤝 Bạn đồng hành mới: ${b.name}!`);
    setTimeout(() => buddySay(b.lines[0]!), 1500);
    completeQuest("d1-buddy");
  }, 2200);
}

function buddyLines(): string[] {
  return BUDDIES.find((b) => b.id === hb().buddy?.id)?.lines ?? [];
}

function buddySay(text: string) {
  hb().set({ chat: [...hb().chat, { id: ++msgSeq, from: "them" as const, text }].slice(-60) });
  buddyAnim.bubble = { text, until: game.time + 4 };
}

function buddyCheer() {
  if (!hb().buddy) return;
  buddyAnim.gesture = { id: "cheers", until: game.time + 2 };
}

export function sendBuddyMessage(raw: string): boolean {
  const text = sanitizeUserText(raw);
  if (!text || !hb().buddy) return false;
  if (containsUrl(text)) {
    ui().showToast("Chưa cho gửi link nhé.");
    return false;
  }
  hb().set({ chat: [...hb().chat, { id: ++msgSeq, from: "me" as const, text }].slice(-60) });
  completeQuest("d3-ask");
  const lines = buddyLines();
  setTimeout(() => buddySay(lines[++lineIdx % lines.length]!), 1200 + Math.random() * 1200);
  return true;
}

// Bạn đồng hành đi theo người chơi trong mọi tầng.
export const buddyAnim: AvatarAnim = {
  x: 0,
  z: 0,
  ry: 0,
  speed: 0,
  pose: "stand",
  holding: null,
  gesture: null,
  bubble: null,
};

export function placeBuddyNearPlayer() {
  const b = SCENES[game.scene].bounds;
  buddyAnim.x = Math.min(b.maxX - 1, game.player.x + 1.2);
  buddyAnim.z = Math.min(b.maxZ - 1, game.player.z + 0.6);
}

export function buddyNear(): boolean {
  return !!hb().buddy && Math.hypot(buddyAnim.x - game.player.x, buddyAnim.z - game.player.z) < 3;
}

export function updateBuddy(dt: number) {
  if (!hb().buddy) return;
  const p = game.player;
  const dx = p.x - buddyAnim.x;
  const dz = p.z - buddyAnim.z;
  const d = Math.hypot(dx, dz);
  const ox = buddyAnim.x;
  const oz = buddyAnim.z;
  if (d > 1.6) {
    const sp = Math.min(4.2, 1.5 + d) * dt;
    const scene = SCENES[game.scene];
    const next = resolveCollisions(
      { x: buddyAnim.x + (dx / d) * sp, z: buddyAnim.z + (dz / d) * sp },
      scene.colliders,
      scene.bounds,
    );
    buddyAnim.x = next.x;
    buddyAnim.z = next.z;
    let diff = Math.atan2(dx, dz) - buddyAnim.ry;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    buddyAnim.ry += diff * Math.min(1, dt * 10);
  } else if (d > 0.01) {
    let diff = Math.atan2(dx, dz) - buddyAnim.ry;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    buddyAnim.ry += diff * Math.min(1, dt * 4);
  }
  buddyAnim.speed = Math.hypot(buddyAnim.x - ox, buddyAnim.z - oz) / Math.max(dt, 1e-3);
  if (d > 12) placeBuddyNearPlayer();
}
