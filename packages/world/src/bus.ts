import type { AABB } from "./coords";
import { STREET } from "./coords";
import { mulberry32 } from "./layout";

/**
 * Bus N29 (brief §7). Chạy hướng −x ở làn z = +2, dừng ở bến 14 giây, vòng lại sau 10–18 giây.
 * Ở M1 client tự chạy mô phỏng này (offline). Từ M2 server chạy và broadcast — cùng một class.
 */
export const BUS = {
  laneZ: STREET.busLaneZ,
  startX: 62,
  endX: -62,
  stopX: 5,
  length: 11,
  width: 2.5,
  height: 4.4,
  cruise: 9,
  accel: 2.2,
  stopSeconds: 14,
  gapMin: 10,
  gapMax: 18,
  /** Cửa ở đầu xe, phía lề (+z). Bus chạy −x nên đầu xe ở x nhỏ hơn. */
  doorOffsetX: -4,
} as const;

export type BusPhase = "arriving" | "stopped" | "departing" | "away";

export interface BusState {
  x: number;
  phase: BusPhase;
  speed: number;
  /** Tăng mỗi lần dừng ở bến; dùng để biết "lần dừng kế tiếp" khi xuống bus. */
  stopCount: number;
  /** Giây còn lại của pha hiện tại (stopped/away). */
  timer: number;
}

export class BusSim implements BusState {
  x: number = BUS.startX;
  phase: BusPhase = "arriving";
  speed: number = BUS.cruise;
  stopCount = 0;
  timer = 0;
  private rnd: () => number;

  constructor(seed = 29, initial?: Partial<BusState>) {
    this.rnd = mulberry32(seed);
    Object.assign(this, initial);
  }

  step(dt: number): void {
    switch (this.phase) {
      case "arriving": {
        const d = this.x - BUS.stopX;
        this.speed = Math.min(BUS.cruise, Math.sqrt(2 * BUS.accel * Math.max(d, 0)) + 0.4);
        this.x -= this.speed * dt;
        if (this.x <= BUS.stopX + 0.02) {
          this.x = BUS.stopX;
          this.speed = 0;
          this.phase = "stopped";
          this.timer = BUS.stopSeconds;
          this.stopCount++;
        }
        break;
      }
      case "stopped":
        this.timer -= dt;
        if (this.timer <= 0) this.phase = "departing";
        break;
      case "departing":
        this.speed = Math.min(BUS.cruise, this.speed + BUS.accel * dt);
        this.x -= this.speed * dt;
        if (this.x <= BUS.endX) {
          this.phase = "away";
          this.timer = BUS.gapMin + this.rnd() * (BUS.gapMax - BUS.gapMin);
        }
        break;
      case "away":
        this.timer -= dt;
        if (this.timer <= 0) {
          this.x = BUS.startX;
          this.speed = BUS.cruise;
          this.phase = "arriving";
        }
        break;
    }
  }

  get doorsOpen(): boolean {
    return this.phase === "stopped";
  }

  get door(): { x: number; z: number } {
    return { x: this.x + BUS.doorOffsetX, z: BUS.laneZ + BUS.width / 2 + 0.5 };
  }

  /** Collider động (người không đi xuyên bus). */
  collider(): AABB {
    return {
      minX: this.x - BUS.length / 2,
      maxX: this.x + BUS.length / 2,
      minZ: BUS.laneZ - BUS.width / 2,
      maxZ: BUS.laneZ + BUS.width / 2,
    };
  }
}
