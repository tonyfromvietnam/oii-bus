import * as THREE from "three";

/**
 * Bảng màu Oii Street. Lambert cho đa số (rẻ trên mobile), Standard cho mặt đường ướt + vũng nước.
 * Vật liệu "sáng theo trời tối" nằm trong `glowing` — Lights.tsx cập nhật emissiveIntensity theo darkness.
 */

const lambert = (color: string, extra: THREE.MeshLambertMaterialParameters = {}) =>
  new THREE.MeshLambertMaterial({ color, ...extra });

const glow = (color: string, emissive: string, base = 0.15, max = 1.2) => {
  const m = new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: base });
  m.userData.glowBase = base;
  m.userData.glowMax = max;
  return m;
};

export const M = {
  brick0: lambert("#8a3a2c"),
  brick1: lambert("#7b3328"),
  brick2: lambert("#9a4a35"),
  brickDark: lambert("#5c2a22"),
  stone: lambert("#d9d2c3"),
  white: lambert("#ece7dc"),
  slate: lambert("#3b4048"),
  chimneyPot: lambert("#a65a3a"),
  glassDark: lambert("#1c2630"),
  glassLit: glow("#3a3020", "#ffb347", 0.1, 0.85),
  shopGlass: glow("#2a3a3a", "#fff1c9", 0.3, 1.0),
  pubGlass: glow("#3a2a18", "#ff9f40", 0.2, 1.0),
  lampGlass: glow("#fff2c0", "#ffd27a", 0.2),
  belisha: glow("#ff9a2a", "#ff8a10", 0.5),
  taxiSign: glow("#ffb020", "#ffb020", 0.3),
  headlight: glow("#ffffff", "#fff6dd", 0.3),
  road: new THREE.MeshStandardMaterial({ color: "#2a2d31", roughness: 0.42, metalness: 0.1 }),
  pavement: new THREE.MeshStandardMaterial({ color: "#6d6f70", roughness: 0.6, metalness: 0.05 }),
  kerb: lambert("#8d8b86"),
  puddle: new THREE.MeshStandardMaterial({ color: "#151b22", roughness: 0.05, metalness: 0.85 }),
  lineYellow: lambert("#e0b630"),
  lineWhite: lambert("#e8e8e2"),
  red: lambert("#c8102e"),
  redDark: lambert("#8e0b20"),
  black: lambert("#16181b"),
  metal: lambert("#3c4246"),
  wood: lambert("#7a5434"),
  bark: lambert("#4f4136"),
  foliage0: lambert("#b8862a"),
  foliage1: lambert("#d0a23a"),
  leaf0: lambert("#c7782a"),
  leaf1: lambert("#d9a640"),
  pubGreen: lambert("#173b2e"),
  gold: lambert("#c9a24a"),
  flowers: lambert("#c94f7a"),
  basket: lambert("#2f5a2a"),
  fruitOrange: lambert("#e8862a"),
  fruitGreen: lambert("#7fae3a"),
  fruitRed: lambert("#b8302a"),
  shelterGlass: new THREE.MeshLambertMaterial({ color: "#9fb4c0", transparent: true, opacity: 0.25 }),
  busGlass: new THREE.MeshLambertMaterial({ color: "#1e2a33", transparent: true, opacity: 0.55 }),
  tyre: lambert("#111214"),
  skin: lambert("#e2b48f"),
  trousers: lambert("#2b2f38"),
  pigeon: lambert("#7d8590"),
  pigeonHead: lambert("#4a5560"),
} satisfies Record<string, THREE.Material>;

export type MatKey = keyof typeof M;

const doorCache = new Map<string, THREE.MeshLambertMaterial>();
export function doorMaterial(color: string): THREE.MeshLambertMaterial {
  let m = doorCache.get(color);
  if (!m) {
    m = lambert(color);
    doorCache.set(color, m);
  }
  return m;
}

/** Vật liệu sáng dần khi tối. Biển hiệu (signs.ts) tự đăng ký vào đây. */
export const glowing: THREE.MeshLambertMaterial[] = [
  M.glassLit,
  M.shopGlass,
  M.pubGlass,
  M.lampGlass,
  M.taxiSign,
  M.headlight,
];

export function applyDarkness(darkness: number) {
  for (const m of glowing) {
    const base = (m.userData.glowBase as number | undefined) ?? 0.1;
    const max = (m.userData.glowMax as number | undefined) ?? 1.2;
    m.emissiveIntensity = base + (max - base) * darkness;
  }
}
