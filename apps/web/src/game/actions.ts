import {
  CHAT_MIN_INTERVAL_MS,
  containsUrl,
  distance2D,
  distanceBand,
  sanitizeUserText,
  type Gesture,
} from "@xom-oii/shared";
import { BUS, OII_STREET, seatById, type Spot } from "@xom-oii/world";
import { vi } from "../copy/vi";
import { game } from "./state";
import { ui } from "./ui";

/** Hành động của người chơi. M1 chạy offline; từ M2 các hàm này gửi message lên server. */

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export type Interaction =
  { kind: "spot"; spot: Spot } | { kind: "bus-door" } | { kind: "alight" } | { kind: "stand-up" };

export function interactionLabel(i: Interaction): string {
  switch (i.kind) {
    case "spot":
      return vi.prompts[i.spot.kind === "seat" ? "seat" : i.spot.kind];
    case "bus-door":
      return vi.prompts["bus-door"];
    case "alight":
      return vi.prompts.alight;
    case "stand-up":
      return vi.prompts.standUp;
  }
}

/** Tìm tương tác khả dụng gần nhất. */
export function findInteraction(): Interaction | null {
  const p = game.player;
  const bus = game.bus;
  if (p.pose === "bus") return bus.doorsOpen && bus.stopCount > p.boardedAtStop ? { kind: "alight" } : null;
  if (p.pose === "sit") return { kind: "stand-up" };
  if (bus.doorsOpen) {
    const door = bus.door;
    if (Math.hypot(door.x - p.x, door.z - p.z) < 2.2) return { kind: "bus-door" };
  }
  let best: Spot | null = null;
  let bestD = Infinity;
  for (const s of OII_STREET.spots) {
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

export function interact() {
  const i = findInteraction();
  if (!i) return;
  const p = game.player;
  const u = ui();
  switch (i.kind) {
    case "stand-up": {
      const seat = p.seatId ? seatById(p.seatId) : null;
      p.pose = "stand";
      p.seatId = null;
      p.y = 0.12;
      if (seat) {
        p.x = seat.x + Math.sin(seat.ry) * 0.6;
        p.z = seat.z + Math.cos(seat.ry) * 0.6;
      }
      return;
    }
    case "bus-door":
      p.pose = "bus";
      p.boardedAtStop = game.bus.stopCount;
      p.seatId = null;
      game.input.moveTarget = null;
      u.showToast(vi.bus.boarded);
      return;
    case "alight":
      p.pose = "stand";
      p.x = game.bus.door.x;
      p.z = BUS.laneZ + BUS.width / 2 + 1.4;
      p.y = 0.12;
      p.ry = 0;
      u.showToast(vi.bus.alighted);
      return;
    case "spot":
      break;
  }
  const s = i.spot;
  switch (s.kind) {
    case "seat": {
      const seat = seatById(s.seatId!);
      if (!seat) return;
      p.pose = "sit";
      p.seatId = seat.id;
      p.x = seat.x;
      p.z = seat.z;
      p.y = seat.y - 0.75;
      p.ry = seat.ry;
      game.input.moveTarget = null;
      return;
    }
    case "phone-box":
      say(vi.ringRing, 3);
      setTimeout(() => u.showToast(pick(vi.callHome)), 1400);
      return;
    case "postbox":
      u.showToast(pick(vi.postbox));
      return;
    case "shop":
      if (p.holding === "tea") return u.showToast(vi.shop.alreadyHolding);
      if (!u.spend(1.2)) return u.showToast(vi.shop.broke);
      p.holding = "tea";
      u.showToast(vi.shop.bought);
      setTimeout(() => u.pushLog({ who: "Oii Express", text: pick(vi.shop.flavour), band: "system" }), 1500);
      return;
    case "npc-dave":
      daveSays(pick(vi.dave.lines));
      game.dave.nextLineAt = game.time + 12;
      return;
    case "door-17":
      u.showToast(vi.door17);
      return;
    case "pub-door":
      u.showToast(vi.pubDoor);
      return;
    case "quest-board":
      u.showToast(vi.questBoard);
      return;
    case "bus-door":
      return;
  }
}

export function gesture(id: Gesture) {
  const p = game.player;
  if (id === "tea" && p.holding !== "tea") {
    ui().showToast(vi.needTea);
    return;
  }
  p.gesture = { id, until: game.time + 2.2 };
}

let lastChatAt = 0;

/** Chat offline: kiểm tra giống server (sanitize, chặn link, 1 tin/giây). */
export function sendChat(raw: string): boolean {
  const u = ui();
  const text = sanitizeUserText(raw);
  if (!text) return false;
  if (containsUrl(text)) {
    u.showToast(vi.chat.rejectedLink);
    return false;
  }
  const now = performance.now();
  if (now - lastChatAt < CHAT_MIN_INTERVAL_MS) {
    u.showToast(vi.chat.tooFast);
    return false;
  }
  lastChatAt = now;
  say(text, 5);
  u.pushLog({ who: vi.hud.you, text, band: "self" });
  return true;
}

/** Dave nói: người chơi nhận nội dung theo dải khoảng cách, giống chat thật (brief §9). */
export function daveSays(text: string) {
  const d = game.dave;
  d.bubble = { text, until: game.time + 4.5 };
  const band = distanceBand(distance2D(d, game.player));
  ui().pushLog({ who: vi.dave.name, text: band === "out" ? vi.hud.murmur : text, band });
}
