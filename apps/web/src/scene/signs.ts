import * as THREE from "three";

export interface SignOptions {
  bg: string;
  fg: string;
  font?: string;
  width?: number;
  height?: number;
  border?: string;
  lines?: string[];
}

/** Biển hiệu vẽ bằng canvas → texture (MeshBasic: luôn rõ, phẳng, hợp phong cách đồ chơi). */
export function signMaterial(text: string, o: SignOptions): THREE.MeshBasicMaterial {
  const w = o.width ?? 512;
  const h = o.height ?? 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = o.bg;
    const r = Math.min(w, h) * 0.18;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fill();
    if (o.border) {
      ctx.strokeStyle = o.border;
      ctx.lineWidth = Math.max(6, h * 0.06);
      ctx.beginPath();
      ctx.roundRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2, r * 0.7);
      ctx.stroke();
    }
    ctx.fillStyle = o.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = o.lines ?? [text];
    const lh = h / (lines.length + 0.3);
    ctx.font = o.font ?? `800 ${Math.floor(lh * 0.62)}px "Baloo 2", "Be Vietnam Pro", system-ui, sans-serif`;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, lh * (i + 0.65)));
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
}
