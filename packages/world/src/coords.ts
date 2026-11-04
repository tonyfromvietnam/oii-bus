/** Hộp va chạm trên mặt phẳng XZ (mét). Mỗi scene có hệ toạ độ riêng, sàn ở y = 0. */
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const box = (cx: number, cz: number, w: number, d: number): AABB => ({
  minX: cx - w / 2,
  maxX: cx + w / 2,
  minZ: cz - d / 2,
  maxZ: cz + d / 2,
});
