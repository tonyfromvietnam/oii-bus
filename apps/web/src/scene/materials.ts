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

const celCache = new Map<string, THREE.MeshToonMaterial>();

/** Cel-shading cho nhân vật (giữ vẻ mascot dễ thương). */
export function cel(color: string): THREE.MeshToonMaterial {
  let m = celCache.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap });
    celCache.set(color, m);
  }
  return m;
}

const cache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Vật liệu PBR cho cảnh vật: nhám, không kim loại, nhận ánh sáng môi trường → mềm và thật hơn toon.
 * Cache theo màu để StaticBuilder gộp được geometry (ít draw call).
 */
export function mat(color: string, roughness = 0.82, metalness = 0): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}|${metalness}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    cache.set(key, m);
  }
  return m;
}

/** Kim loại sơn (lan can, cột đèn). */
export const metal = (color: string) => mat(color, 0.38, 0.55);
/** Kính / nước: bóng, phản chiếu môi trường. */
export const shiny = (color: string) => mat(color, 0.12, 0.15);

/** Vật liệu tự phát sáng (đèn, đèn dây, cửa sổ sáng) — sáng hơn khi London tối. */
export const glowing: THREE.MeshStandardMaterial[] = [];
const glowCache = new Map<string, THREE.MeshStandardMaterial>();
/** Cache theo màu + độ sáng: cùng vật liệu thì StaticBuilder gộp được (ít draw call, máy yếu nhẹ hơn). */
export function glow(color: string, base = 0.35, max = 1): THREE.MeshStandardMaterial {
  const key = `${color}|${base}|${max}`;
  const hit = glowCache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    emissive: color,
    emissiveIntensity: base,
  });
  m.userData.glowBase = base;
  m.userData.glowMax = max;
  glowing.push(m);
  glowCache.set(key, m);
  return m;
}

export function applyDarkness(d: number) {
  for (const m of glowing) {
    const base = m.userData.glowBase as number;
    const max = m.userData.glowMax as number;
    m.emissiveIntensity = base + (max - base) * d;
  }
}

// ---------------------------------------------------------- texture tự vẽ ---
export type TexKind = "planks" | "asphalt" | "grass" | "brick" | "flagstone";

function canvasTex(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size = 512,
): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

const shade = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return `#${c.getHexString()}`;
};

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const DRAW: Record<TexKind, (color: string) => (ctx: CanvasRenderingContext2D, n: number) => void> = {
  planks: (color) => (ctx, n) => {
    const rows = 8;
    const h = n / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * n * 0.5;
      while (x < n) {
        const w = n * (0.35 + rnd() * 0.4);
        ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.08);
        ctx.fillRect(x, r * h, w, h);
        ctx.strokeStyle = shade(color, -0.06);
        ctx.globalAlpha = 0.35;
        for (let g = 0; g < 4; g++) {
          ctx.beginPath();
          const gy = r * h + h * (0.2 + rnd() * 0.6);
          ctx.moveTo(x, gy);
          ctx.bezierCurveTo(
            x + w * 0.3,
            gy + (rnd() - 0.5) * 6,
            x + w * 0.7,
            gy + (rnd() - 0.5) * 6,
            x + w,
            gy,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = shade(color, -0.2);
        ctx.fillRect(x + w - 2, r * h, 2, h);
        x += w;
      }
      ctx.fillStyle = shade(color, -0.22);
      ctx.fillRect(0, r * h, n, 2);
    }
  },
  asphalt: (color) => (ctx, n) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.14);
      ctx.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 2, 1 + rnd() * 2);
    }
  },
  grass: (color) => (ctx, n) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 7000; i++) {
      ctx.strokeStyle = shade(color, (rnd() - 0.45) * 0.16);
      const x = rnd() * n;
      const y = rnd() * n;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 4);
      ctx.stroke();
    }
  },
  brick: (color) => (ctx, n) => {
    ctx.fillStyle = "#e8e0d2";
    ctx.fillRect(0, 0, n, n);
    const rows = 16;
    const h = n / rows;
    const w = n / 6;
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c < 7; c++) {
        ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.1);
        ctx.fillRect(c * w + (r % 2 ? w / 2 : 0) + 2, r * h + 2, w - 4, h - 4);
      }
    }
  },
  flagstone: (color) => (ctx, n) => {
    ctx.fillStyle = shade(color, -0.12);
    ctx.fillRect(0, 0, n, n);
    const k = 4;
    const s = n / k;
    for (let r = 0; r < k; r++) {
      for (let c = 0; c < k; c++) {
        ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.08);
        ctx.fillRect(c * s + 3, r * s + 3, s - 6, s - 6);
        for (let i = 0; i < 120; i++) {
          ctx.fillStyle = shade(color, (rnd() - 0.5) * 0.12);
          ctx.fillRect(c * s + 3 + rnd() * (s - 8), r * s + 3 + rnd() * (s - 8), 2, 2);
        }
      }
    }
  },
};

const texCache = new Map<string, THREE.MeshStandardMaterial>();

/** Vật liệu có texture lặp (`rx` × `ry` lần trên mỗi mặt). */
export function texMat(
  kind: TexKind,
  color: string,
  rx = 1,
  ry = 1,
  roughness = 0.85,
): THREE.MeshStandardMaterial {
  const key = `${kind}|${color}|${rx}|${ry}`;
  let m = texCache.get(key);
  if (!m) {
    const t = canvasTex(DRAW[kind](color));
    t.repeat.set(rx, ry);
    m = new THREE.MeshStandardMaterial({ map: t, roughness });
    texCache.set(key, m);
  }
  return m;
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
