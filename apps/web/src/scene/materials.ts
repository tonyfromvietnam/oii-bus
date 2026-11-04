import * as THREE from "three";

/**
 * Vật liệu toon (cel-shading 3 nấc) cho cảm giác dễ thương, phẳng, sáng. Một vật liệu cho mỗi màu
 * (cache) để StaticBuilder gộp được geometry → ít draw call.
 */
const gradientMap = (() => {
  const data = new Uint8Array([150, 210, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

const cache = new Map<string, THREE.MeshToonMaterial>();

export function toon(color: string): THREE.MeshToonMaterial {
  let m = cache.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap });
    cache.set(color, m);
  }
  return m;
}

/** Vật liệu tự phát sáng (đèn, đèn dây, màn hình) — sáng hơn khi London tối. */
export const glowing: THREE.MeshToonMaterial[] = [];
export function glow(color: string, base = 0.35, max = 1): THREE.MeshToonMaterial {
  const m = new THREE.MeshToonMaterial({ color, gradientMap, emissive: color, emissiveIntensity: base });
  m.userData.glowBase = base;
  m.userData.glowMax = max;
  glowing.push(m);
  return m;
}

export function applyDarkness(d: number) {
  for (const m of glowing) {
    const base = m.userData.glowBase as number;
    const max = m.userData.glowMax as number;
    m.emissiveIntensity = base + (max - base) * d;
  }
}

/** Bảng màu theo website OiiMate: nền xanh bạc hà, xanh teal, chữ navy, mascot xanh nhạt + vàng nhạt. */
export const C = {
  accent: "#4e9297",
  ink: "#1f2d4d",
  oiiBlue: "#a8d3d9",
  oiiYellow: "#fde3a0",
  mint: "#dcefe6",
  bus: "#4e9297",
  busDark: "#3c7479",
  cushion: "#fde3a0",
  cream: "#f1f8ec",
  deck: "#f4ead7",
  deckLine: "#e6d6b8",
  rail: "#fde3a0",
  white: "#ffffff",
  glass: "#cfe9ee",
  tyre: "#33405c",
  road: "#a9b4bd",
  roadLine: "#ffffff",
  pavement: "#e9e4d8",
  grass: "#bfe3b4",
  water: "#8fd0e6",
  skin: "#ffe1c7",
  blush: "#f6b3c2",
  wood: "#d9a874",
  woodDark: "#a8774f",
  pink: "#f6b3c2",
  peach: "#ffd2b5",
  lilac: "#d6ccf2",
  sky: "#a8d3d9",
  lemon: "#fde3a0",
  green: "#6cc58a",
  stone: "#efe6d6",
  gold: "#f2c14e",
  leaf: "#8fcf8c",
} as const;
