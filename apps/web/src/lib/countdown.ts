import { vi } from "../copy/vi";

/** "2 ngày 3 giờ 4 phút" — bỏ đơn vị bằng 0 ở đầu, hiện giây khi còn < 1 giờ. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3_600);
  const m = Math.floor((total % 3_600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d} ${vi.units.day}`);
  if (d || h) parts.push(`${h} ${vi.units.hour}`);
  parts.push(`${m} ${vi.units.minute}`);
  if (!d && !h) parts.push(`${s} ${vi.units.second}`);
  return parts.join(" ");
}
