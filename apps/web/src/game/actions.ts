import {
  CHAT_MIN_INTERVAL_MS,
  containsUrl,
  distance2D,
  distanceBand,
  sanitizeUserText,
  type Gesture,
} from "@oii-bus/shared";
import { DUCKS, SCENES, landmarkStatus, seatById, type SceneId, type Spot } from "@oii-bus/world";
import { awardMerit, applyMerit, type MeritKind } from "@oii-bus/shared";
import { lofi } from "../audio/lofi";
import { bell, mo } from "../audio/sfx";
import { vi, viTemple } from "../copy/vi";
import { meritTotal } from "./match";
import { bump, gainXp } from "./progress";
import { XP } from "@oii-bus/shared";
import { NPCS, type Npc } from "./npcs";
import { progressQuest } from "./quests";
import { game } from "./state";
import { ui } from "./ui";

/** Hành động của người chơi. Bản thử chạy offline; từ M2 các hàm này gửi message lên server. */

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export type Interaction = { kind: "spot"; spot: Spot } | { kind: "duck"; id: string } | { kind: "stand-up" };

export function interactionLabel(i: Interaction): string {
  if (i.kind === "stand-up") return vi.prompts.standUp;
  if (i.kind === "duck") return vi.prompts.duck;
  return vi.prompts[i.spot.kind];
}

export function findInteraction(): Interaction | null {
  const p = game.player;
  if (p.pose !== "stand") return { kind: "stand-up" };
  if (game.scene === "bus") {
    for (const d of DUCKS) {
      if (!game.ducksFound.has(d.id) && Math.hypot(d.x - p.x, d.z - p.z) < 1.1)
        return { kind: "duck", id: d.id };
    }
  }
  let best: Spot | null = null;
  let bestD = Infinity;
  for (const s of SCENES[game.scene].spots) {
    const d = Math.hypot(s.x - p.x, s.z - p.z);
    if (d < s.radius && d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best ? { kind: "spot", spot: best } : null;
}

export function say(text: string, seconds = 4) {
  game.player.bubble = { text, until: game.time + seconds };
}

function standUp() {
  const p = game.player;
  const seat = p.seatId ? seatById(game.scene, p.seatId) : null;
  p.pose = "stand";
  p.seatId = null;
  if (seat) {
    p.x = seat.x + Math.sin(seat.ry) * 0.7;
    p.z = seat.z + Math.cos(seat.ry) * 0.7;
  }
  stopFocus();
  ui().set({ seatedAtDesk: false });
}

export function goToScene(scene: SceneId) {
  const u = ui();
  u.set({ fade: true });
  setTimeout(() => {
    const sp = SCENES[scene].spawn;
    Object.assign(game.player, { x: sp.x, z: sp.z, ry: sp.ry, pose: "stand", seatId: null });
    game.input.moveTarget = null;
    game.scene = scene;
    stopFocus();
    u.set({ scene, chatOpen: false, seatedAtDesk: false });
    if (scene === "library") {
      lofi.start();
      u.set({ music: { ...ui().music, on: true } });
      u.showToast(vi.arrive.library);
    } else if (scene === "temple") {
      u.showToast(vi.arrive.temple);
    } else {
      u.showToast(vi.arrive.bus);
    }
    setTimeout(() => ui().set({ fade: false }), 120);
  }, 280);
}

export function toggleMusic() {
  const u = ui();
  const on = !u.music.on;
  if (on) lofi.start();
  else lofi.stop();
  u.set({ music: { ...u.music, on } });
}

export function setVolume(v: number) {
  lofi.setVolume(v);
  ui().set({ music: { ...ui().music, volume: v } });
}

export function interact() {
  const i = findInteraction();
  if (!i) return;
  const p = game.player;
  const u = ui();
  if (i.kind === "stand-up") return standUp();
  if (i.kind === "duck") {
    game.ducksFound.add(i.id);
    gainXp(XP.duck);
    u.showToast(vi.lines.duck(game.ducksFound.size));
    progressQuest("ducks", game.ducksFound.size);
    return;
  }
  const s = i.spot;
  switch (s.kind) {
    case "seat": {
      const seat = seatById(game.scene, s.seatId!);
      if (!seat || isSeatTaken(seat.id)) return;
      Object.assign(p, { pose: "sit", seatId: seat.id, x: seat.x, z: seat.z, ry: seat.ry });
      game.input.moveTarget = null;
      u.set({ seatedAtDesk: !!seat.desk });
      if (seat.id.startsWith("hotpot")) progressQuest("hotpot", 1);
      return;
    }
    case "photo": {
      const { current } = landmarkStatus(game.route);
      if (!current) return u.showToast(vi.lines.photoNone);
      const name = vi.landmarks[current.id].name;
      p.gesture = { id: "cheers", until: game.time + 1.5 };
      if (game.photos.has(current.id)) return u.showToast(vi.lines.photoAgain(name));
      game.photos.add(current.id);
      gainXp(XP.photo);
      u.showToast(vi.lines.photoTaken(name));
      progressQuest("photos", game.photos.size);
      return;
    }
    case "bubble-tea":
      if (p.holding === "tea") return u.showToast(vi.lines.teaHolding);
      if (!u.spend(3.8)) return u.showToast(vi.lines.broke);
      p.holding = "tea";
      gainXp(XP.bubbleTea);
      u.showToast(vi.lines.teaBought);
      progressQuest("tea", 1);
      return;
    case "karaoke":
      p.gesture = { id: "cheers", until: game.time + 2.5 };
      say("🎤 ♪ ♫ ♪", 3);
      u.showToast(pick(vi.lines.karaoke));
      return;
    case "meal-deal":
      if (!u.spend(3.5)) return u.showToast(vi.lines.broke);
      u.showToast(pick(vi.lines.mealDeal));
      return;
    case "quest-board":
      u.set({ questsOpen: true });
      return;
    case "umbrella":
      u.showToast(vi.lines.umbrella);
      return;
    case "to-library":
      return goToScene("library");
    case "to-temple":
      return goToScene("temple");
    case "meetup-board":
      u.set({ city: { ...u.city, open: true } });
      return;
    case "incense": {
      const pts = earnMerit("incense");
      if (pts > 0) {
        p.holding = null;
        p.gesture = { id: "sorry", until: game.time + 2.5 };
        u.showToast(viTemple.incense(pts));
        gainXp(XP.incense);
        bump("incense");
        progressQuest("incense", 1);
      }
      return;
    }
    case "wish-tree": {
      const pts = earnMerit("wish");
      if (pts > 0) u.showToast(viTemple.wish(pts));
      return;
    }
    case "bell": {
      const pts = earnMerit("bell");
      if (pts > 0) {
        bell();
        u.showToast(viTemple.bell(pts));
      }
      return;
    }
    case "donate":
      u.set({ donateOpen: true });
      return;
    case "matchmaker":
      u.set({ duyen: { ...u.duyen, open: true } });
      return;
    case "to-bus":
      return goToScene("bus");
    case "bookshelf":
      say(pick(vi.lines.books), 4.5);
      return;
    case "cat":
      u.showToast(pick(vi.lines.cat));
      return;
    case "radio":
      return toggleMusic();
  }
}

function isSeatTaken(seatId: string): boolean {
  return NPCS.some(
    (n) =>
      n.scene === game.scene &&
      n.pose !== "stand" &&
      Math.hypot(n.x - seatById(game.scene, seatId)!.x, n.z - seatById(game.scene, seatId)!.z) < 0.2,
  );
}

export function gesture(id: Gesture) {
  const p = game.player;
  if (id === "tea" && p.holding !== "tea") {
    ui().showToast(vi.needTea);
    return;
  }
  p.gesture = { id, until: game.time + 2.2 };
  if (id === "wave") {
    for (const n of NPCS) {
      if (n.scene !== game.scene || game.waved.has(n.id)) continue;
      if (distance2D(n, p) < 4.5) {
        game.waved.add(n.id);
        gainXp(XP.wave);
        n.gesture = { id: n.mode === "study" ? "hug" : "wave", until: game.time + 2.5 };
      }
    }
    progressQuest("wave", game.waved.size);
  }
}

let lastChatAt = 0;

/** Chat offline: kiểm tra giống server (sanitize, chặn link, 1 tin/giây, thư viện không chat). */
export function sendChat(raw: string): boolean {
  const u = ui();
  if (SCENES[game.scene].quiet) {
    u.showToast(vi.hud.quietChat);
    return false;
  }
  const text = sanitizeUserText(raw);
  if (!text) return false;
  if (containsUrl(text)) {
    u.showToast("Chưa cho gửi link trên xe đâu nhé.");
    return false;
  }
  const now = performance.now();
  if (now - lastChatAt < CHAT_MIN_INTERVAL_MS) {
    u.showToast("Từ từ thôi, mỗi giây một câu.");
    return false;
  }
  lastChatAt = now;
  say(text, 5);
  u.pushLog({ who: vi.hud.you, text, band: "self" });
  return true;
}

/** Bot nói: người chơi nhận nội dung theo dải khoảng cách, giống chat thật (brief §9). */
export function npcSays(n: Npc, text: string) {
  n.bubble = { text, until: game.time + 4.5 };
  if (SCENES[n.scene].quiet) return; // thư viện: chỉ bong bóng emoji, không vào log
  const band = distanceBand(distance2D(n, game.player));
  ui().pushLog({ who: n.name, text: band === "out" ? vi.hud.murmur : text, band });
}

export function startFocus() {
  game.focus.running = true;
  game.focus.elapsed = 0;
  ui().set({ focus: { running: true, seconds: 0 } });
}

export function stopFocus() {
  game.focus.running = false;
  ui().set({ focus: { running: false, seconds: 0 } });
}

/** Cộng phúc đức (theo luật trong @oii-bus/shared). Trả về số điểm được cộng, 0 nếu bị chặn. */
export function earnMerit(kind: MeritKind, units = 1, quiet = false): number {
  const now = Date.now();
  const r = awardMerit(kind, game.merit, now, units);
  if (!r.ok) {
    if (!quiet) ui().showToast(r.reason === "cooldown" ? viTemple.cooldown(r.waitSec) : viTemple.cap);
    return 0;
  }
  game.merit = applyMerit(game.merit, kind, r.points, now);
  ui().set({ merit: meritTotal() });
  return r.points;
}

export function donate(amount: number) {
  const u = ui();
  if (!u.spend(amount)) return u.showToast(viTemple.broke);
  const pts = earnMerit("donate", amount);
  if (pts > 0) u.showToast(viTemple.donated(amount, pts));
  u.set({ donateOpen: false });
}

/** Gõ mõ khi đang tụng kinh. */
export const tapMo = mo;

/** Thư viện: một chạm là ngồi vào bàn trống và bắt đầu tập trung. */
export function sitAndFocus() {
  const p = game.player;
  const free = SCENES.library.seats.find((s) => s.desk && !isSeatTaken(s.id));
  if (!free) return;
  Object.assign(p, { pose: "sit", seatId: free.id, x: free.x, z: free.z, ry: free.ry });
  game.input.moveTarget = null;
  ui().set({ seatedAtDesk: true });
  startFocus();
}
