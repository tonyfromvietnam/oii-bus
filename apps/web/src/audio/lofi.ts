/**
 * Máy phát lofi tự sinh bằng WebAudio: hợp âm jazz êm, trống nhẹ có swing, tiếng đĩa than lạo xạo,
 * thỉnh thoảng một nốt giai điệu pentatonic. Không cần file nhạc (nhẹ, không lo bản quyền).
 * Chỉ bắt đầu sau một thao tác của người dùng (chính sách autoplay của trình duyệt).
 */

const BPM = 72;
const STEP = 60 / BPM / 4; // nốt móc kép
const LOOKAHEAD = 0.25;

// Fmaj9 → Em7 → Dm9 → Cmaj7 (MIDI)
const CHORDS = [
  [53, 57, 60, 64, 67],
  [52, 55, 59, 62, 66],
  [50, 53, 57, 60, 64],
  [48, 52, 55, 59, 62],
];
const PENTA = [72, 74, 76, 79, 81, 84];

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

class Lofi {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private volume = 0.6;
  playing = false;

  start() {
    if (this.playing) return;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) this.setup(new Ctx());
    const ctx = this.ctx!;
    void ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(this.volume * 0.5, ctx.currentTime, 0.6);
    this.playing = true;
    this.nextTime = ctx.currentTime + 0.1;
    this.startCrackle();
    this.timer = window.setInterval(() => this.schedule(), 60);
  }

  stop() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    const c = this.crackle;
    this.crackle = null;
    setTimeout(() => c?.stop(), 1500);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.ctx && this.master && this.playing) {
      this.master.gain.setTargetAtTime(this.volume * 0.5, this.ctx.currentTime, 0.1);
    }
  }

  private setup(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.bus = ctx.createBiquadFilter();
    this.bus.type = "lowpass";
    this.bus.frequency.value = 2400;
    this.bus.Q.value = 0.3;
    this.bus.connect(comp).connect(this.master).connect(ctx.destination);
    // bộ đệm tiếng ồn dùng chung cho trống + đĩa than
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  private startCrackle() {
    const ctx = this.ctx!;
    // đĩa than: tiếng xì nhỏ + tiếng lách tách thưa
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.5 : 0);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    src.connect(hp).connect(g).connect(this.master!);
    src.start();
    this.crackle = src;
  }

  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      // swing: nốt lẻ trễ hơn chút
      const swing = this.step % 2 === 0 ? 1.18 : 0.82;
      this.nextTime += STEP * swing;
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(step: number, t: number) {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const chord = CHORDS[bar % CHORDS.length]!;
    if (s === 0) this.chord(chord, t, STEP * 15);
    if (s === 10 && Math.random() < 0.5) this.chord(chord.slice(1, 4), t, STEP * 5, 0.6);
    if (s === 0 || s === 7 || (s === 10 && Math.random() < 0.4)) this.kick(t);
    if (s === 4 || s === 12) this.snare(t);
    if (s % 2 === 0) this.hat(t, s % 4 === 2 ? 0.05 : 0.03);
    if (s === 0) this.bass(chord[0]! - 12, t, STEP * 7);
    if (s === 8) this.bass(chord[0]! - 12 + 7, t, STEP * 6);
    if ((s === 6 || s === 14) && Math.random() < 0.35)
      this.pluck(PENTA[Math.floor(Math.random() * PENTA.length)]!, t);
  }

  private chord(notes: number[], t: number, dur: number, level = 1) {
    for (const n of notes) {
      // piano điện êm: sine + triangle lệch tông nhẹ
      for (const [type, detune, vol] of [
        ["sine", -6, 0.05],
        ["triangle", 5, 0.025],
      ] as const) {
        const ctx = this.ctx!;
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = midi(n);
        o.detune.value = detune;
        const g = ctx.createGain();
        const v = vol * level;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v, t + 0.04);
        g.gain.exponentialRampToValueAtTime(v * 0.4, t + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.bus!);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    }
  }

  private bass(n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = midi(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private pluck(n: number, t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = midi(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + 1.3);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + 0.32);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, vol: number, dur: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.bus!);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  }

  private snare(t: number) {
    this.noiseHit(t, "bandpass", 1800, 0.12, 0.18);
  }

  private hat(t: number, vol: number) {
    this.noiseHit(t, "highpass", 7000, vol, 0.05);
  }
}

export const lofi = new Lofi();
