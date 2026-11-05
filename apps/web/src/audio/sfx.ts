/** Hiệu ứng âm thanh nhỏ tự sinh bằng WebAudio: chuông chùa, mõ, tiếng "ting" khi được ghép. */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  ctx ??= new Ctx();
  void ctx.resume();
  return ctx;
}

function partial(c: AudioContext, freq: number, gain: number, decay: number, t: number) {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + decay + 0.05);
}

/** Chuông đồng: các hoạ âm không hài hoà, ngân dài. */
export function bell() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  for (const [ratio, g, d] of [
    [1, 0.18, 5],
    [2.0, 0.08, 3.5],
    [2.76, 0.06, 2.5],
    [5.4, 0.03, 1.4],
  ] as const)
    partial(c, 110 * ratio, g, d, t);
}

/** Mõ gỗ: cộc ngắn. */
export function mo() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  partial(c, 820, 0.12, 0.09, t);
  partial(c, 1240, 0.05, 0.05, t);
}

/** Tiếng "ting ting" vui khi được se duyên. */
export function chime() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  partial(c, 1046, 0.08, 0.6, t);
  partial(c, 1318, 0.07, 0.7, t + 0.12);
  partial(c, 1568, 0.06, 0.9, t + 0.24);
}
