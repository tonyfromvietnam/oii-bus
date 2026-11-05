import { levelFor, zoneLabel } from "@oii-bus/shared";
import { viDaily } from "../copy/daily";
import type { DayStats } from "../game/progress";

export interface CardData {
  nickname: string;
  color: string;
  streak: number;
  xp: number;
  today: DayStats;
  quote: string;
  invite: string;
}

const W = 1080;
const H = 1350;
const INK = "#1f2d4d";
const TEAL = "#4e9297";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Vẽ mascot tròn kiểu OiiMate (bong bóng chat có đuôi, mắt chấm, miệng cười). */
function mascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.55, cy + r * 0.7);
  ctx.lineTo(cx - r * 0.95, cy + r * 1.15);
  ctx.lineTo(cx - r * 0.15, cy + r * 0.95);
  ctx.fill();
  ctx.fillStyle = INK;
  for (const dx of [-0.32, 0.32]) {
    ctx.beginPath();
    ctx.arc(cx + dx * r, cy - r * 0.08, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = r * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.12, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

/** Thẻ khoe hằng ngày 1080×1350 (tỉ lệ 4:5, hợp đăng Facebook/Instagram). */
export async function drawShareCard(d: CardData): Promise<HTMLCanvasElement> {
  try {
    await document.fonts?.ready;
  } catch {
    /* dùng font dự phòng */
  }
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const font = (w: number, px: number) => `${w} ${px}px "Nunito", system-ui, sans-serif`;

  // nền xanh bạc hà → xanh nhạt
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f1f8ec");
  g.addColorStop(1, "#d9edf0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // khung
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 6;
  roundRect(ctx, 36, 36, W - 72, H - 72, 48);
  ctx.stroke();

  // đầu thẻ
  ctx.textAlign = "center";
  ctx.fillStyle = TEAL;
  ctx.font = font(900, 54);
  ctx.fillText("Oii-Bus", W / 2, 128);
  ctx.fillStyle = INK;
  ctx.globalAlpha = 0.6;
  ctx.font = font(700, 30);
  const date = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    timeZone: "Europe/London",
  });
  ctx.fillText(date, W / 2, 174);
  ctx.globalAlpha = 1;

  // mascot + tên
  mascot(ctx, W / 2, 330, 110, d.color);
  ctx.fillStyle = INK;
  ctx.font = font(700, 40);
  ctx.fillText(viDaily.card.title, W / 2, 530);
  ctx.font = font(900, 92);
  ctx.fillText(d.nickname, W / 2, 630);

  // chuỗi ngày + cấp
  const lv = levelFor(d.xp);
  const boxY = 690;
  const boxH = 190;
  const half = (W - 72 * 2 - 30) / 2;
  const box = (x: number, w: number, fill: string) => {
    ctx.fillStyle = fill;
    roundRect(ctx, x, boxY, w, boxH, 36);
    ctx.fill();
  };
  box(72, half, "#ffffff");
  box(72 + half + 30, half, TEAL);
  ctx.fillStyle = INK;
  ctx.font = font(900, 84);
  ctx.fillText(`🔥 ${d.streak}`, 72 + half / 2, boxY + 102);
  ctx.font = font(700, 30);
  ctx.fillText(viDaily.card.days, 72 + half / 2, boxY + 152);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(900, 72);
  ctx.fillText(zoneLabel(lv.zone), 72 + half * 1.5 + 30, boxY + 96);
  ctx.font = font(700, 30);
  ctx.fillText(lv.zone.title, 72 + half * 1.5 + 30, boxY + 148);

  // ba số liệu hôm nay
  const statY = 910;
  const sw = (W - 72 * 2 - 2 * 24) / 3;
  const stats: [number, string][] = [
    [d.today.work, viDaily.stats.work],
    [d.today.incense, viDaily.stats.incense],
    [d.today.merit, viDaily.stats.merit],
  ];
  stats.forEach(([n, label], i) => {
    const x = 72 + i * (sw + 24);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x, statY, sw, 150, 30);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = font(900, 64);
    ctx.fillText(String(n), x + sw / 2, statY + 78);
    ctx.font = font(700, 26);
    ctx.globalAlpha = 0.7;
    ctx.fillText(label, x + sw / 2, statY + 122);
    ctx.globalAlpha = 1;
  });

  // câu hôm nay
  ctx.fillStyle = INK;
  ctx.font = `italic ${font(600, 34)}`;
  const lines = wrap(ctx, `“${d.quote}”`, W - 220);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 1118 + i * 44));

  // nút + link mời
  ctx.fillStyle = "#fde3a0";
  roundRect(ctx, W / 2 - 330, 1196, 660, 70, 35);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = font(900, 34);
  ctx.fillText(viDaily.card.cta, W / 2, 1243);
  ctx.globalAlpha = 0.55;
  ctx.font = font(700, 22);
  ctx.fillText(d.invite.replace(/^https?:\/\//, ""), W / 2, 1294);
  ctx.globalAlpha = 1;
  return cv;
}
