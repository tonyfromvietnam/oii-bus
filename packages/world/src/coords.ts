/**
 * Hệ toạ độ Oii Street (mét), brief §7.
 *  - x chạy dọc phố (tây → đông), đi được trong [-36, 36]
 *  - z: lòng đường [-4, 4], vỉa hè [-7, -4] (bắc) và [4, 7] (nam), mặt tiền nhà tại z = ±7
 *  - y hướng lên, mặt đường y = 0
 */
export const STREET = {
  minX: -36,
  maxX: 36,
  roadHalfWidth: 4,
  facadeZ: 7,
  /** Làn bus N29 (UK đi bên trái, bus chạy hướng −x). */
  busLaneZ: 2,
} as const;

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const WALKABLE: AABB = {
  minX: STREET.minX,
  maxX: STREET.maxX,
  minZ: -STREET.facadeZ,
  maxZ: STREET.facadeZ,
};

export type Side = "north" | "south";
