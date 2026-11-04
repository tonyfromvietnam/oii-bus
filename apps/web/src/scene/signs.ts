import * as THREE from "three";
import { glowing } from "./materials";

export interface SignOptions {
  bg: string;
  fg: string;
  font?: string;
  width?: number;
  height?: number;
  border?: string;
  lines?: string[];
  glowMax?: number;
}

/** Biển hiệu vẽ bằng canvas → texture. Sáng dần khi trời tối (đăng ký vào `glowing`). */
export function signMaterial(text: string, o: SignOptions): THREE.MeshLambertMaterial {
  const w = o.width ?? 512;
  const h = o.height ?? 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = o.bg;
    ctx.fillRect(0, 0, w, h);
    if (o.border) {
      ctx.strokeStyle = o.border;
      ctx.lineWidth = Math.max(4, h * 0.06);
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
    }
    ctx.fillStyle = o.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = o.lines ?? [text];
    const lh = h / (lines.length + 0.4);
    ctx.font = o.font ?? `bold ${Math.floor(lh * 0.7)}px "Be Vietnam Pro", system-ui, sans-serif`;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, lh * (i + 0.7)));
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({
    map: tex,
    emissive: "#ffffff",
    emissiveMap: tex,
    emissiveIntensity: 0.1,
  });
  mat.userData.glowBase = 0.05;
  mat.userData.glowMax = o.glowMax ?? 0.75;
  glowing.push(mat);
  return mat;
}
