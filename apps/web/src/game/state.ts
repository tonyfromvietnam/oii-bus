import { emptyLedger, type Gesture, type Hat } from "@oii-bus/shared";
import { SCENES, type SceneId } from "@oii-bus/world";

/**
 * Trạng thái mô phỏng, thay đổi mỗi frame → để ngoài React (mutable) cho nhẹ.
 * UI cần re-render thì đọc từ store Zustand (`ui.ts`).
 */

export type Pose = "stand" | "sit" | "sleep";

export interface AvatarAnim {
  x: number;
  z: number;
  ry: number;
  /** Tốc độ thật (m/s) để chạy animation nhún nhảy. */
  speed: number;
  pose: Pose;
  holding: "tea" | null;
  gesture: { id: Gesture; until: number } | null;
  bubble: { text: string; until: number } | null;
}

export interface PlayerState extends AvatarAnim {
  seatId: string | null;
  nickname: string;
  color: string;
  hat: Hat;
}

const spawn = SCENES.bus.spawn;

export const game = {
  time: 0,
  scene: "bus" as SceneId,
  player: {
    x: spawn.x,
    z: spawn.z,
    ry: spawn.ry,
    speed: 0,
    pose: "stand",
    holding: null,
    gesture: null,
    bubble: null,
    seatId: null,
    nickname: "Bánh Bao",
    color: "#a8d3d9",
    hat: "beanie",
  } as PlayerState,
  input: {
    keys: new Set<string>(),
    joy: { x: 0, y: 0 },
    moveTarget: null as { x: number; z: number } | null,
  },
  /** Vị trí trên tuyến (m), tính từ giờ thật. */
  route: 0,
  ducksFound: new Set<string>(),
  waved: new Set<string>(),
  photos: new Set<string>(),
  focus: { running: false, elapsed: 0 },
  /** Sổ phúc đức tuần này (bản thật: server giữ, MeritEvent). */
  merit: emptyLedger(),
  chantElapsed: 0,
  env: { darkness: 0 },
};

export type Game = typeof game;

// Debug cho Playwright smoke test (chỉ đọc). Bản offline: không có dữ liệu nhạy cảm.
declare global {
  interface Window {
    __oiiBus?: Game;
  }
}
if (typeof window !== "undefined") window.__oiiBus = game;
