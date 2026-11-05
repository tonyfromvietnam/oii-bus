import * as THREE from "three";

/**
 * Logo OiiMate vẽ bằng code (không cần file ảnh): hai bong bóng chat chồng nhau, xanh nhạt + vàng nhạt,
 * mắt chấm navy, kèm chữ "OiiMate". Dùng cho biển hiệu, cờ, sàn, thân xe.
 */
const BLUE = new Path2D("M11 1a10 10 0 1 1-6.4 17.7L1 21l1.3-4.6A10 10 0 0 1 11 1z");
const YELLOW = new Path2D("M23 3a9 9 0 1 0 5.8 15.9L32 21l-1.1-4.1A9 9 0 0 0 23 3z");

export const BRAND = {
  mint: "#f1f8ec",
  teal: "#4e9297",
  navy: "#1f2d4d",
  blue: "#a8d3d9",
  yellow: "#fde3a0",
} as const;

/** Vẽ hai bong bóng, góc trên trái tại (x, y), cao `h` (khung gốc 34 × 22). */
export function drawBubbles(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, outline = true) {
  const s = h / 22;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  for (const [path, fill] of [
    [BLUE, BRAND.blue],
    [YELLOW, BRAND.yellow],
  ] as const) {
    ctx.fillStyle = fill;
    ctx.fill(path);
    if (outline) {
      ctx.strokeStyle = BRAND.navy;
      ctx.lineWidth = 1.1;
      ctx.stroke(path);
    }
  }
  ctx.fillStyle = BRAND.navy;
  for (const [cx, cy, r] of [
    [8, 10, 1.3],
    [13, 10, 1.3],
    [21, 12, 1.2],
    [26, 12, 1.2],
  ] as const) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // miệng cười
  ctx.strokeStyle = BRAND.navy;
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(10.5, 12.5, 2, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(23.5, 14.3, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
}

export interface LogoOptions {
  /** Chữ chính, mặc định "OiiMate". */
  title?: string;
  /** Dòng phụ nhỏ bên dưới. */
  sub?: string;
  bg?: string;
  fg?: string;
  accent?: string;
  width?: number;
  height?: number;
  /** Chỉ vẽ bong bóng (huy hiệu tròn). */
  badge?: boolean;
}

function texture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const cache = new Map<string, THREE.MeshBasicMaterial>();

/** Biển logo: bong bóng bên trái + chữ thương hiệu (vd. "Oii Viet", "OiiNails"). */
export function logoMaterial(o: LogoOptions = {}): THREE.MeshBasicMaterial {
  const key = JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit;
  const badge = o.badge ?? false;
  const w = o.width ?? (badge ? 256 : 1024);
  const h = o.height ?? (badge ? 256 : 256);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    if (badge) {
      ctx.fillStyle = o.bg ?? BRAND.mint;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = o.accent ?? BRAND.teal;
      ctx.lineWidth = w * 0.05;
      ctx.stroke();
      const bh = h * 0.42;
      drawBubbles(ctx, w / 2 - (bh * 34) / 22 / 2, h / 2 - bh / 2, bh);
    } else {
      ctx.fillStyle = o.bg ?? BRAND.mint;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, h * 0.22);
      ctx.fill();
      ctx.strokeStyle = o.accent ?? BRAND.teal;
      ctx.lineWidth = h * 0.06;
      ctx.beginPath();
      ctx.roundRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1, h * 0.17);
      ctx.stroke();
      const bh = h * 0.56;
      const bw = (bh * 34) / 22;
      const title = o.title ?? "OiiMate";
      ctx.font = `900 ${Math.floor(h * (o.sub ? 0.4 : 0.5))}px "Nunito", system-ui, sans-serif`;
      const tw = ctx.measureText(title).width;
      const total = bw + h * 0.12 + tw;
      const x0 = (w - total) / 2;
      drawBubbles(ctx, x0, (h - bh) / 2, bh);
      ctx.fillStyle = o.fg ?? BRAND.navy;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(title, x0 + bw + h * 0.12, o.sub ? h * 0.4 : h * 0.53);
      if (o.sub) {
        ctx.font = `800 ${Math.floor(h * 0.17)}px "Nunito", system-ui, sans-serif`;
        ctx.fillStyle = o.accent ?? BRAND.teal;
        ctx.fillText(o.sub, x0 + bw + h * 0.12, h * 0.74);
      }
    }
  }
  const m = new THREE.MeshBasicMaterial({ map: texture(canvas), transparent: true, toneMapped: false });
  cache.set(key, m);
  return m;
}

/** Hình logo lớn in trên sàn quảng trường (tròn, nền trong suốt ngoài vòng). */
export function floorLogoMaterial(): THREE.MeshStandardMaterial {
  const n = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = BRAND.teal;
    ctx.beginPath();
    ctx.arc(n / 2, n / 2, n / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BRAND.mint;
    ctx.beginPath();
    ctx.arc(n / 2, n / 2, n / 2 - 46, 0, Math.PI * 2);
    ctx.fill();
    const bh = n * 0.34;
    drawBubbles(ctx, n / 2 - (bh * 34) / 22 / 2, n * 0.2, bh);
    ctx.fillStyle = BRAND.navy;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${n * 0.15}px "Nunito", system-ui, sans-serif`;
    ctx.fillText("OiiMate", n / 2, n * 0.7);
    ctx.font = `800 ${n * 0.055}px "Nunito", system-ui, sans-serif`;
    ctx.fillStyle = BRAND.teal;
    ctx.fillText("người bạn đồng hành ở UK", n / 2, n * 0.81);
  }
  return new THREE.MeshStandardMaterial({ map: texture(canvas), transparent: true, roughness: 0.8 });
}
