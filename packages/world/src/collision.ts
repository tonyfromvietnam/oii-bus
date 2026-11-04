import { AVATAR_RADIUS } from "@xom-oii/shared";
import { WALKABLE, type AABB } from "./coords";

export interface Point {
  x: number;
  z: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Giữ điểm (kèm bán kính avatar) trong vùng đi được của phố. */
export function clampToWalkable(p: Point, radius = AVATAR_RADIUS, bounds: AABB = WALKABLE): Point {
  return {
    x: clamp(p.x, bounds.minX + radius, bounds.maxX - radius),
    z: clamp(p.z, bounds.minZ + radius, bounds.maxZ - radius),
  };
}

/** Hình tròn (avatar) có chạm AABB không. */
export function circleIntersectsBox(p: Point, radius: number, b: AABB): boolean {
  const dx = p.x - clamp(p.x, b.minX, b.maxX);
  const dz = p.z - clamp(p.z, b.minZ, b.maxZ);
  return dx * dx + dz * dz < radius * radius;
}

/** Đẩy hình tròn ra khỏi một AABB theo hướng ngắn nhất. */
function pushOut(p: Point, radius: number, b: AABB): Point {
  const cx = clamp(p.x, b.minX, b.maxX);
  const cz = clamp(p.z, b.minZ, b.maxZ);
  const dx = p.x - cx;
  const dz = p.z - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 > 1e-12) {
    const d = Math.sqrt(d2);
    const k = (radius - d) / d;
    return { x: p.x + dx * k, z: p.z + dz * k };
  }
  // Tâm nằm trong hộp: đẩy ra cạnh gần nhất.
  const options = [
    { x: b.minX - radius, z: p.z, cost: p.x - b.minX },
    { x: b.maxX + radius, z: p.z, cost: b.maxX - p.x },
    { x: p.x, z: b.minZ - radius, cost: p.z - b.minZ },
    { x: p.x, z: b.maxZ + radius, cost: b.maxZ - p.z },
  ];
  options.sort((a, b2) => a.cost - b2.cost);
  const best = options[0]!;
  return { x: best.x, z: best.z };
}

/**
 * Giải va chạm cho vị trí mong muốn. Dùng ở client (dự đoán) và server (validate),
 * nên phải tất định: cùng input → cùng output.
 */
export function resolveCollisions(
  desired: Point,
  colliders: readonly AABB[],
  radius = AVATAR_RADIUS,
  bounds: AABB = WALKABLE,
): Point {
  let p = clampToWalkable(desired, radius, bounds);
  for (let iter = 0; iter < 3; iter++) {
    let moved = false;
    for (const box of colliders) {
      if (circleIntersectsBox(p, radius, box)) {
        p = pushOut(p, radius, box);
        moved = true;
      }
    }
    p = clampToWalkable(p, radius, bounds);
    if (!moved) break;
  }
  return p;
}
