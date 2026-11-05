import {
  AFK_MULT,
  STATION_IDS,
  autoRate,
  levelNumber,
  nextMilestone,
  totalRate,
  MILESTONES,
  type StationId,
} from "@oii-bus/shared";
import { BUS_SCENE, STATION_SPOTS, ZONE_IDS, zoneAt, type ZoneId } from "@oii-bus/world";
import { useEffect, useRef, useState } from "react";
import { viFarm } from "../copy/farm";
import { vi } from "../copy/vi";
import { helperPrice, hire, setAfk, tapStation, useFarm } from "../game/farm";
import { useProgress } from "../game/progress";
import { game } from "../game/state";
import { useUi } from "../game/ui";

const pill =
  "rounded-full bg-white/95 text-[var(--ink)] shadow-[0_2px_10px_rgba(31,45,77,0.10)] backdrop-blur-sm";
const fmt = (n: number) => Math.floor(n).toLocaleString("vi-VN");
const money = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });

/** Hai bong bóng logo OiiMate (SVG) dùng lại ở nhiều chỗ. */
export function OiiBubbles({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 22) / 34}
      viewBox="0 0 34 22"
      aria-hidden
      className="inline-block shrink-0"
    >
      <path
        d="M11 1a10 10 0 1 1-6.4 17.7L1 21l1.3-4.6A10 10 0 0 1 11 1z"
        fill="#a8d3d9"
        stroke="#1f2d4d"
        strokeWidth="0.8"
      />
      <path
        d="M23 3a9 9 0 1 0 5.8 15.9L32 21l-1.1-4.1A9 9 0 0 0 23 3z"
        fill="#fde3a0"
        stroke="#1f2d4d"
        strokeWidth="0.8"
      />
      <circle cx="8" cy="10" r="1.2" fill="#1f2d4d" />
      <circle cx="13" cy="10" r="1.2" fill="#1f2d4d" />
      <circle cx="21" cy="12" r="1.1" fill="#1f2d4d" />
      <circle cx="26" cy="12" r="1.1" fill="#1f2d4d" />
    </svg>
  );
}

/** Ví + tốc độ farm, luôn thấy ở góc trên. */
export function FarmChip() {
  const wallet = useUi((s) => s.wallet);
  const farm = useFarm((s) => s.farm);
  const afk = useFarm((s) => s.afk);
  const rate = totalRate(farm, afk ? AFK_MULT : 1);
  return (
    <div className={`${pill} flex h-10 items-center gap-2 px-3 text-sm font-bold`} data-testid="wallet">
      <span>💷 £{money(wallet)}</span>
      {rate > 0 && <span className="text-[var(--accent)]">⚙️ {viFarm.perSec(rate)}</span>}
    </div>
  );
}

/** Cấp số + zone, gọn trong một chip. */
export function LevelBadge() {
  const xp = useProgress((s) => s.xp);
  return (
    <span className="rounded-full bg-[var(--ink)] px-2 py-0.5 text-xs font-black text-white">
      Lv {levelNumber(xp)}
    </span>
  );
}

const ZONE_TARGET: Record<ZoneId, { x: number; z: number }> = {
  temple: { x: -37.5, z: 0.6 },
  deadline: STATION_SPOTS.essay,
  nails: STATION_SPOTS.nails,
  plaza: BUS_SCENE.spawn,
  viet: STATION_SPOTS.pho,
  tea: STATION_SPOTS.tea,
  front: { x: 40.5, z: 0 },
};

/** Thanh khu: bấm là chạy tới, khỏi lạc trên sàn to. */
export function ZoneBar() {
  const [zone, setZone] = useState<ZoneId>(zoneAt(game.player.x));
  useEffect(() => {
    const id = setInterval(() => setZone(zoneAt(game.player.x)), 300);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className={`${pill} pointer-events-auto flex max-w-full gap-0.5 overflow-x-auto p-1`}
      data-testid="zones"
    >
      {ZONE_IDS.map((z) => (
        <button
          key={z}
          type="button"
          title={viFarm.zones[z].name}
          onClick={() => {
            if (game.player.pose !== "stand") return;
            game.input.moveTarget = { ...ZONE_TARGET[z] };
          }}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-sm font-bold ${z === zone ? "bg-[var(--ink)] text-white" : ""}`}
          aria-pressed={z === zone}
        >
          {viFarm.zones[z].icon}
          <span className="ml-1 hidden lg:inline">{viFarm.zones[z].name}</span>
        </button>
      ))}
    </div>
  );
}

/** Bảng làm việc ở quầy: nút to để bấm/giữ (spam), thuê người giúp để quầy tự chạy. */
export function StationPanel() {
  const open = useFarm((s) => s.open);
  if (!open) return null;
  return <Station id={open} />;
}

function Station({ id }: { id: StationId }) {
  const st = viFarm.stations[id];
  const count = useFarm((s) => s.farm.counts[id]);
  const helpers = useFarm((s) => s.farm.helpers[id]);
  const afk = useFarm((s) => s.afk);
  const farm = useFarm((s) => s.farm);
  const pop = useFarm((s) => s.pop);
  const wallet = useUi((s) => s.wallet);
  const set = useFarm((s) => s.set);
  const hold = useRef<number | null>(null);
  const cost = helperPrice(id);
  const next = nextMilestone(Math.floor(count));
  const prev = [...MILESTONES].reverse().find((m) => m <= count) ?? 0;
  const rate = autoRate(farm, id, afk ? AFK_MULT : 1);

  const stop = () => {
    if (hold.current !== null) clearInterval(hold.current);
    hold.current = null;
  };
  useEffect(() => stop, []);
  const press = () => {
    if (!tapStation(id)) useUi.getState().showToast(viFarm.tooFast);
    stop();
    hold.current = window.setInterval(() => tapStation(id), 120);
  };

  return (
    <div
      className="pop pointer-events-auto absolute bottom-[132px] left-1/2 w-[min(400px,94vw)] -translate-x-1/2 sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:translate-x-0 rounded-[28px] border-[2.5px] border-[var(--blue)] bg-[var(--cream)] p-4 text-[var(--ink)] shadow-2xl"
      data-testid="station"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-extrabold tracking-wide text-[var(--accent)] uppercase">
            {st.place}
          </div>
          <h2 className="font-display text-2xl leading-tight font-black">
            {st.icon} {st.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => set({ open: null })}
          className="h-9 w-9 shrink-0 rounded-full bg-white text-lg font-bold shadow-sm"
          aria-label={vi.hud.close}
          data-testid="station-close"
        >
          ✕
        </button>
      </div>
      <p className="mt-1 text-sm opacity-70">{st.hint}</p>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              press();
            }}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onContextMenu={(e) => e.preventDefault()}
            className="h-28 w-28 touch-none rounded-full border-4 border-white bg-[var(--accent)] text-5xl shadow-[0_6px_0_#3c7479] transition-transform select-none active:translate-y-1 active:shadow-[0_2px_0_#3c7479]"
            aria-label={st.verb}
            data-testid="station-tap"
          >
            {st.icon}
          </button>
          {pop && (
            <span
              key={pop.id}
              className="float-up pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-sm font-black whitespace-nowrap text-[var(--accent)] shadow"
            >
              {pop.text}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-3xl font-black tabular-nums" data-testid="station-count">
            {fmt(count)}
          </div>
          <div className="text-sm font-semibold opacity-70">{st.unit}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width]"
              style={{ width: `${Math.min(100, ((count - prev) / (next - prev)) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs font-semibold opacity-60">🏆 {viFarm.next(next)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
        <span className="text-2xl">{st.helperIcon}</span>
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-bold">
            {st.helper} <span className="font-semibold opacity-60">· {viFarm.owned(helpers)}</span>
          </div>
          <div className="text-xs opacity-70">{rate > 0 ? `⚙️ ${viFarm.perSec(rate)}` : viFarm.autoOff}</div>
        </div>
        <button
          type="button"
          onClick={() => hire(id)}
          disabled={wallet + 1e-9 < cost}
          className="shrink-0 rounded-full bg-[var(--ink)] px-3 py-2 text-sm font-bold text-white disabled:opacity-35"
          data-testid="station-hire"
        >
          {viFarm.hire(cost)}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] opacity-50">{viFarm.holdHint}</p>
    </div>
  );
}

/** Màn treo máy: tối, nhẹ, số chạy đều. Bấm "Thức dậy" để chơi tiếp. */
export function AfkOverlay() {
  const afk = useFarm((s) => s.afk);
  const farm = useFarm((s) => s.farm);
  const session = useFarm((s) => s.session);
  const last = useFarm((s) => s.last);
  const wallet = useUi((s) => s.wallet);
  const merit = useUi((s) => s.merit);
  const xp = useProgress((s) => s.xp);
  if (!afk) return null;
  const v = viFarm.afk;
  const rate = totalRate(farm, AFK_MULT) + 1;
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-[#14203a]/95 p-5 text-center text-white"
      data-testid="afk"
    >
      <div className="afk-bob">
        <OiiBubbles size={120} />
      </div>
      <div>
        <h2 className="font-display text-3xl font-black">😴 {v.title}…</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm opacity-75">{v.body}</p>
      </div>
      <div className="rounded-full bg-white/10 px-4 py-1.5 text-lg font-black text-[var(--sun)]">
        {v.rate(rate)}
      </div>
      <div className="text-xs opacity-70">{v.selfWork(viFarm.stations[last].unit)}</div>
      <div className="grid w-full max-w-sm grid-cols-3 gap-2 text-sm font-bold">
        <div className="rounded-2xl bg-white/10 p-2">
          💷<div className="tabular-nums">£{money(wallet)}</div>
        </div>
        <div className="rounded-2xl bg-white/10 p-2">
          ⭐<div className="tabular-nums">Lv {levelNumber(xp)}</div>
        </div>
        <div className="rounded-2xl bg-white/10 p-2">
          🪷<div className="tabular-nums">{fmt(merit)}</div>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-white/5 p-3 text-left text-sm">
        <div className="mb-1 text-xs font-extrabold tracking-wide uppercase opacity-60">{v.session}</div>
        {STATION_IDS.map((id) => (
          <div key={id} className="flex justify-between py-0.5">
            <span>
              {viFarm.stations[id].icon} {viFarm.stations[id].unit}
            </span>
            <b className="tabular-nums" data-testid={`afk-${id}`}>
              +{fmt(session[id])}
            </b>
          </div>
        ))}
      </div>
      <p className="max-w-sm text-xs opacity-60">{v.offline}</p>
      <button
        type="button"
        onClick={() => void setAfk(false)}
        className="rounded-full bg-[var(--sun)] px-8 py-3 text-lg font-black text-[var(--ink)] shadow-lg"
        data-testid="afk-wake"
      >
        ☀️ {v.wake}
      </button>
    </div>
  );
}

/** Mở lại app sau một thời gian: khoe những gì người giúp đã làm. */
export function AwayModal() {
  const away = useFarm((s) => s.away);
  const creator = useUi((s) => s.creatorOpen);
  const afk = useFarm((s) => s.afk);
  const set = useFarm((s) => s.set);
  if (!away || creator || afk) return null;
  const a = viFarm.away;
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[var(--ink)]/35 p-4">
      <div
        className="pop w-full max-w-sm rounded-[28px] bg-[var(--cream)] p-5 text-center text-[var(--ink)] shadow-2xl"
        data-testid="away"
      >
        <OiiBubbles size={64} />
        <h2 className="font-display mt-2 text-2xl font-black">{a.title}</h2>
        <p className="text-sm opacity-70">
          {a.duration(away.ms)} · {a.body}
        </p>
        <ul className="mt-3 flex flex-col gap-1 text-left">
          {STATION_IDS.filter((id) => away.gained[id] > 0).map((id) => (
            <li key={id} className="flex justify-between rounded-xl bg-white px-3 py-1.5 text-sm shadow-sm">
              <span>
                {viFarm.stations[id].icon} {viFarm.stations[id].unit}
              </span>
              <b>+{fmt(away.gained[id])}</b>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-bold text-[var(--accent)]">
          {a.earned(away.reward.pay, away.reward.xp, away.reward.merit)}
        </p>
        <button
          type="button"
          onClick={() => set({ away: null })}
          className="mt-4 w-full rounded-full bg-[var(--accent)] py-2.5 font-black text-white"
        >
          {a.ok}
        </button>
      </div>
    </div>
  );
}

/** Nút chính: treo máy. */
export function AfkButton() {
  return (
    <button
      type="button"
      onClick={() => void setAfk(true)}
      className="pointer-events-auto rounded-full bg-[var(--accent)] px-6 py-3 text-base font-black text-white shadow-lg active:scale-[0.98]"
      data-testid="afk-button"
    >
      😴 {viFarm.afk.button}
    </button>
  );
}
