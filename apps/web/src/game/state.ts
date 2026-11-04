import type { Gesture } from "@xom-oii/shared";
import { BusSim, OII_STREET } from "@xom-oii/world";

/**
 * Trạng thái mô phỏng, thay đổi mỗi frame → để ngoài React (mutable) cho nhẹ.
 * UI cần re-render thì đọc từ store Zustand (`ui.ts`).
 */

export type Pose = "stand" | "sit" | "bus";

export interface AvatarAnim {
  x: number;
  y: number;
  z: number;
  ry: number;
  /** Tốc độ thật (m/s) để chạy animation đi bộ. */
  speed: number;
  pose: Pose;
  holding: "tea" | null;
  gesture: { id: Gesture; until: number } | null;
  bubble: { text: string; until: number } | null;
}

export interface PlayerState extends AvatarAnim {
  seatId: string | null;
  boardedAtStop: number;
  nickname: string;
  coatColor: string;
  hat: "none" | "beanie" | "cap" | "bucket" | "flat-cap" | "earmuffs";
}

export interface Pigeon {
  x: number;
  z: number;
  y: number;
  ry: number;
  mode: "walk" | "fly";
  timer: number;
  tx: number;
  tz: number;
}

const spawn = OII_STREET.spawn;

export const game = {
  time: 0,
  player: {
    x: spawn.x,
    y: 0.12,
    z: spawn.z,
    ry: spawn.ry,
    speed: 0,
    pose: "stand",
    holding: null,
    gesture: null,
    bubble: null,
    seatId: null,
    boardedAtStop: 0,
    nickname: "Bạn",
    coatColor: "#c96f3b",
    hat: "beanie",
  } as PlayerState,
  dave: {
    x: OII_STREET.dave.x,
    y: 0.12,
    z: OII_STREET.dave.z,
    ry: Math.PI,
    speed: 0,
    pose: "stand",
    holding: null,
    gesture: null,
    bubble: null,
    nextLineAt: 6,
  } as AvatarAnim & { nextLineAt: number },
  camera: { yaw: Math.PI / 2 + 0.5, pitch: 0.3, dist: 6.5 },
  input: {
    keys: new Set<string>(),
    joy: { x: 0, y: 0 },
    moveTarget: null as { x: number; z: number } | null,
    run: false,
  },
  bus: new BusSim(29),
  pigeons: [] as Pigeon[],
  env: { darkness: 1, londonClock: "17:00" },
};

export type Game = typeof game;

// Debug cho Playwright smoke test (chỉ đọc). Bản offline M1: không có dữ liệu nhạy cảm.
declare global {
  interface Window {
    __xom?: Game;
  }
}
if (typeof window !== "undefined") window.__xom = game;
