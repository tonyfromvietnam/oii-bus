/** PRNG tất định để client và server sinh cùng một thế giới. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Đưa v về khoảng [-len/2, len/2). */
export function wrapCentered(v: number, len: number): number {
  return ((((v + len / 2) % len) + len) % len) - len / 2;
}
