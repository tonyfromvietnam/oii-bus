import type { AABB } from "./coords";

/**
 * Dữ liệu phố dùng chung client + server. M0 chỉ có khung kiểu dữ liệu và vài vật thể mốc;
 * M1 điền đầy đủ theo brief §7 (nhà, Oii Express, zebra, bốt điện thoại, bến bus, pub…).
 */

export type SpotKind =
  "phone-box" | "postbox" | "shop" | "npc-dave" | "door-17" | "seat" | "bus-board" | "quest-board";

export interface Spot {
  id: string;
  kind: SpotKind;
  x: number;
  z: number;
  /** Bán kính bấm E được. */
  radius: number;
}

export interface Seat {
  id: string;
  x: number;
  z: number;
  /** Hướng nhìn khi ngồi (radian quanh y). */
  ry: number;
}

export interface WorldLayout {
  colliders: AABB[];
  spots: Spot[];
  seats: Seat[];
  busStop: { x: number; z: number };
}

const box = (cx: number, cz: number, w: number, d: number): AABB => ({
  minX: cx - w / 2,
  maxX: cx + w / 2,
  minZ: cz - d / 2,
  maxZ: cz + d / 2,
});

export const OII_STREET: WorldLayout = {
  colliders: [
    box(4, 5.6, 1.1, 1.1), // bốt điện thoại đỏ
    box(16, 5.6, 0.5, 0.5), // hòm thư
  ],
  spots: [
    { id: "phone-box", kind: "phone-box", x: 4, z: 4.8, radius: 1.5 },
    { id: "postbox", kind: "postbox", x: 16, z: 4.9, radius: 1.3 },
    { id: "door-17", kind: "door-17", x: -10, z: -6.6, radius: 1.4 },
  ],
  seats: [],
  busStop: { x: 10, z: 5 },
};
