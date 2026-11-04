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

/** Bảng màu pastel của Xóm Oii. */
export const C = {
  busRed: "#ff5a5f",
  busRedDark: "#d94448",
  cream: "#fff4e0",
  deck: "#f6dfc0",
  deckLine: "#ecc99c",
  rail: "#ffd166",
  white: "#ffffff",
  ink: "#3b2f45",
  glass: "#bfe6ff",
  tyre: "#4a4256",
  road: "#9ea7b8",
  roadLine: "#ffffff",
  pavement: "#e7dccb",
  grass: "#a8e6a1",
  water: "#7fd1ff",
  skin: "#ffe1c7",
  hair: "#3d2b2b",
  blush: "#ff9eb5",
  wood: "#d9a066",
  woodDark: "#a8714a",
  pink: "#ffb5c8",
  mint: "#9de8c9",
  lilac: "#cdb8ff",
  sky: "#8fd3ff",
  lemon: "#ffe58a",
  peach: "#ffc7a3",
  green: "#6cc58a",
  stone: "#efe6d6",
  gold: "#ffcf4a",
  leaf: "#7fd18b",
} as const;
