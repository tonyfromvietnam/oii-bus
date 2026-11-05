import { GESTURES, HATS, cityName, luckPercent, type Hat } from "@oii-bus/shared";
import { SCENES, landmarkStatus } from "@oii-bus/world";
import { useEffect, useRef, useState } from "react";
import { vi } from "../copy/vi";
import { gesture, interact, sendChat, setVolume, sitAndFocus, stopFocus, toggleMusic } from "../game/actions";
import { FOCUS_GOAL_SECONDS } from "../game/GameLoop";
import { QUEST_GOALS, QUEST_ORDER } from "../game/quests";
import { game } from "../game/state";
import { useUi, type LogEntry, type Me } from "../game/ui";
import { Joystick } from "./Joystick";
import { CityPanel, DonatePanel, FloorSwitcher, SeDuyenPanel } from "./Panels";
import { viCity } from "../copy/vi";

const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
const pill =
  "rounded-full bg-white/95 text-[var(--ink)] shadow-[0_2px_10px_rgba(31,45,77,0.10)] backdrop-blur-sm";

export function Hud() {
  const fade = useUi((s) => s.fade);
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <TopBar />
      <ChatLog />
      <Toast />
      <BottomBar />
      {isTouch && <Joystick />}
      <QuestPanel />
      <DonatePanel />
      <SeDuyenPanel />
      <CityPanel />
      <Help />
      <Creator />
      <div
        className="absolute inset-0 bg-[var(--cream)] transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      />
    </div>
  );
}

function TopBar() {
  const scene = useUi((s) => s.scene);
  const where = useUi((s) => s.where);
  const set = useUi((s) => s.set);
  const doneCount = useUi((s) => Object.keys(s.done).length);
  return (
    <div className="absolute top-0 right-0 left-0 flex items-start justify-between gap-2 p-3">
      <div className={`${pill} flex min-w-0 items-center gap-2 py-1.5 pr-4 pl-2`}>
        <OiiLogo />
        <div className="min-w-0">
          <div className="truncate text-base leading-tight font-black">{vi.scenes[scene].name}</div>
          {scene === "bus" && (
            <div className="truncate text-xs font-semibold opacity-70" data-testid="where">
              {where.now ? `📍 ${where.now}` : `→ ${where.next}`}
            </div>
          )}
          {scene === "temple" && <MeritLine />}
          {scene === "library" && (
            <div className="text-xs font-semibold opacity-70">🤫 {vi.hud.quietShort}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <MusicControl />
        <button
          type="button"
          onClick={() => set({ questsOpen: true })}
          className={`${pill} pointer-events-auto h-10 px-3 text-sm font-bold`}
          aria-label={vi.hud.quests}
        >
          ⭐ {doneCount}/{QUEST_ORDER.length}
        </button>
        <button
          type="button"
          onClick={() => set({ helpOpen: true })}
          className={`${pill} pointer-events-auto h-10 w-10 text-sm font-bold`}
          aria-label={vi.hud.help}
        >
          ?
        </button>
      </div>
    </div>
  );
}

/** Hai bong bóng mascot chồng nhau, theo logo OiiMate. */
function OiiLogo() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden className="mr-1 inline-block align-[-4px]">
      <path d="M11 1a10 10 0 1 1-6.4 17.7L1 21l1.3-4.6A10 10 0 0 1 11 1z" fill="#a8d3d9" />
      <path d="M23 3a9 9 0 1 0 5.8 15.9L32 21l-1.1-4.1A9 9 0 0 0 23 3z" fill="#fde3a0" />
      <circle cx="8" cy="10" r="1.2" fill="#1f2d4d" />
      <circle cx="13" cy="10" r="1.2" fill="#1f2d4d" />
      <circle cx="21" cy="12" r="1.1" fill="#1f2d4d" />
      <circle cx="26" cy="12" r="1.1" fill="#1f2d4d" />
    </svg>
  );
}

function MusicControl() {
  const music = useUi((s) => s.music);
  return (
    <div className={`${pill} pointer-events-auto flex items-center gap-2 py-1 pr-3 pl-1`}>
      <button
        type="button"
        onClick={toggleMusic}
        className={`rounded-full px-3 py-1 text-sm font-semibold ${music.on ? "bg-[var(--accent)] text-white" : ""}`}
        data-testid="music"
      >
        🎧<span className="sr-only">{music.on ? vi.hud.musicOn : vi.hud.musicOff}</span>
      </button>
      {music.on && (
        <input
          id="volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={music.volume}
          aria-label={vi.hud.volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-16 accent-[var(--accent)]"
        />
      )}
    </div>
  );
}

function ChatLog() {
  const log = useUi((s) => s.log);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // chỉ 3 câu gần nhất, mỗi câu hiện 8 giây
  const recent = log.filter((e) => now - e.at < 8000).slice(-3);
  return (
    <div className="absolute top-20 right-3 hidden w-[min(280px,40vw)] flex-col items-end gap-1 sm:flex">
      {recent.map((e) => (
        <LogLine key={e.id} entry={e} />
      ))}
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const opacity = entry.band === "far" ? 0.6 : entry.band === "out" ? 0.4 : 1;
  return (
    <div
      className="max-w-full rounded-2xl bg-white/85 px-3 py-1 text-sm text-[var(--ink)] shadow-sm"
      style={{ opacity }}
    >
      <span className="font-extrabold text-[var(--accent)]">{entry.who}:</span> {entry.text}
    </div>
  );
}

function Toast() {
  const toast = useUi((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const id = setTimeout(() => setShown(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);
  if (!shown) return null;
  return (
    <div
      key={shown.id}
      className="pop absolute bottom-36 left-1/2 w-[min(420px,88vw)] -translate-x-1/2 rounded-3xl border-[2.5px] border-[var(--blue)] bg-white px-4 py-2.5 text-center text-[15px] font-semibold text-[var(--ink)] shadow-lg"
    >
      {shown.text}
    </div>
  );
}

function BottomBar() {
  const prompt = useUi((s) => s.prompt);
  const chatOpen = useUi((s) => s.chatOpen);
  const scene = useUi((s) => s.scene);
  const desk = useUi((s) => s.seatedAtDesk);
  const focus = useUi((s) => s.focus);
  const set = useUi((s) => s.set);
  const [emotes, setEmotes] = useState(false);
  const quiet = SCENES[scene].quiet;
  const mm = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center gap-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {prompt && !chatOpen && (
        <button
          type="button"
          onClick={interact}
          className="pop pointer-events-auto rounded-full bg-[var(--ink)] px-5 py-2 text-[15px] font-bold text-white shadow-md"
          data-testid="prompt"
        >
          {!isTouch && <kbd className="mr-2 rounded-md bg-white/25 px-1.5">E</kbd>}
          {prompt}
        </button>
      )}
      {desk && focus.running ? (
        <div className={`${pill} pointer-events-auto flex items-center gap-3 px-4 py-2`}>
          <span className="text-sm">
            ⏱️ <b className="tabular-nums">{mm(focus.seconds)}</b>
            <span className="opacity-60"> / {mm(FOCUS_GOAL_SECONDS)}</span>
          </span>
          <button
            type="button"
            onClick={stopFocus}
            className="rounded-full bg-black/10 px-3 py-1 text-sm font-bold"
          >
            {vi.hud.focusStop}
          </button>
        </div>
      ) : (
        !chatOpen && <MainAction />
      )}
      {chatOpen ? (
        <ChatInput onClose={() => set({ chatOpen: false })} />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <FloorSwitcher />
          {emotes &&
            GESTURES.map((g, i) => (
              <button
                key={g}
                type="button"
                onClick={() => gesture(g)}
                className={`${pill} pop pointer-events-auto h-10 w-10 text-lg transition-transform active:scale-90`}
                title={`${i + 1} · ${vi.gestures[g].label}`}
              >
                {vi.gestures[g].emoji}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setEmotes(!emotes)}
            className={`${pill} pointer-events-auto h-10 w-10 text-lg ${emotes ? "ring-2 ring-[var(--accent)]" : ""}`}
            aria-label={vi.hud.emotes}
            aria-expanded={emotes}
          >
            {emotes ? "✕" : "😊"}
          </button>
          <button
            type="button"
            onClick={() => (quiet ? useUi.getState().showToast(vi.hud.quietChat) : set({ chatOpen: true }))}
            className={`${pill} pointer-events-auto h-10 w-10 text-lg ${quiet ? "opacity-40" : ""}`}
            aria-label={vi.hud.chat}
          >
            💬
          </button>
        </div>
      )}
      {isTouch && !chatOpen && prompt && (
        <button
          type="button"
          onClick={interact}
          className="pointer-events-auto absolute right-5 bottom-40 h-16 w-16 rounded-full bg-[var(--ink)] text-xl font-extrabold text-white shadow-lg"
        >
          E
        </button>
      )}
    </div>
  );
}

/** Mỗi tầng một việc chính, nút to, rõ ràng. */
function MainAction() {
  const scene = useUi((s) => s.scene);
  const where = useUi((s) => s.where);
  const set = useUi((s) => s.set);
  const big =
    "pointer-events-auto rounded-full bg-[var(--accent)] px-6 py-3 text-base font-black text-white shadow-lg active:scale-[0.98]";
  if (scene === "bus") {
    return (
      <button
        type="button"
        className={big}
        data-testid="city-button"
        onClick={() => set({ city: { ...useUi.getState().city, open: true } })}
      >
        📍 {viCity.button}
        {where.now && <span className="ml-1 font-semibold opacity-80">· {currentCity()}</span>}
      </button>
    );
  }
  if (scene === "library") {
    return (
      <button type="button" className={big} data-testid="focus-button" onClick={sitAndFocus}>
        ⏱️ {vi.hud.focusStart}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={big}
      data-testid="seduyen-button"
      onClick={() => set({ duyen: { ...useUi.getState().duyen, open: true } })}
    >
      💞 {vi.hud.seDuyen}
    </button>
  );
}

/** Thành phố của địa danh đang đi qua (London, Manchester…). */
const currentCity = () => {
  const lm = landmarkStatus(game.route).current;
  return lm ? cityName(lm.city) : "";
};

function MeritLine() {
  const merit = useUi((s) => s.merit);
  return (
    <div className="text-xs font-semibold opacity-70" data-testid="merit">
      🪷 {merit} · 💞 +{luckPercent(merit)}%
    </div>
  );
}

function ChatInput({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  useEffect(() => {
    ref.current?.focus();
    game.input.keys.clear();
  }, []);
  return (
    <form
      className="pointer-events-auto flex w-[min(520px,92vw)] gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (sendChat(text)) setText("");
        onClose();
      }}
    >
      <input
        id="chat"
        ref={ref}
        value={text}
        maxLength={240}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        onBlur={() => setTimeout(onClose, 150)}
        placeholder={vi.hud.chatPlaceholder}
        className="flex-1 rounded-full bg-white px-5 py-2.5 text-[15px] text-[var(--ink)] shadow-md outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </form>
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[var(--ink)]/30 p-4"
      onClick={onClose}
    >
      <div
        className="pop max-h-[86vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-[var(--cream)] p-5 text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function QuestPanel() {
  const open = useUi((s) => s.questsOpen);
  const done = useUi((s) => s.done);
  const progress = useUi((s) => s.progress);
  const set = useUi((s) => s.set);
  const q = vi.quests;
  return (
    <Modal open={open} onClose={() => set({ questsOpen: false })}>
      <h2 className="font-display text-2xl font-extrabold">⭐ {q.title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {QUEST_ORDER.map((id) => {
          const item = q.items[id];
          const v = progress[id] ?? 0;
          const goal = QUEST_GOALS[id];
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
              <span className="text-2xl">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold ${done[id] ? "line-through opacity-50" : ""}`}>
                  {item.title}
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${(v / goal) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs tabular-nums opacity-60">{done[id] ? "✅" : `${v}/${goal}`}</span>
            </li>
          );
        })}
      </ul>
      <h3 className="font-display mt-5 text-xl font-extrabold">🛂 {q.passportTitle}</h3>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {QUEST_ORDER.map((id) => (
          <div
            key={id}
            className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed p-1 text-center ${done[id] ? "rotate-[-4deg] border-[var(--accent)] bg-[var(--mint)]" : "border-black/15 opacity-40"}`}
          >
            <span className="text-3xl">{q.items[id].icon}</span>
            <span className="mt-1 text-[11px] leading-tight font-semibold">{q.items[id].stamp}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => set({ questsOpen: false })}
        className="mt-5 w-full rounded-full bg-[var(--ink)] py-2.5 font-semibold text-white"
      >
        {vi.hud.close}
      </button>
    </Modal>
  );
}

function Help() {
  const open = useUi((s) => s.helpOpen);
  const set = useUi((s) => s.set);
  return (
    <Modal open={open} onClose={() => set({ helpOpen: false })}>
      <h2 className="font-display text-2xl font-extrabold">{vi.hud.help}</h2>
      <p className="mt-1 text-sm opacity-70">{vi.positioning}</p>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {(isTouch
            ? [
                ["Joystick", "Đi lại"],
                ["Chạm sàn", "Đi tới chỗ đó"],
                ["Nút E", "Tương tác"],
              ]
            : vi.help
          ).map(([k, v]) => (
            <tr key={k}>
              <td className="py-1.5 pr-3 font-mono text-xs font-bold text-[var(--accent-ink)]">{k}</td>
              <td className="py-1.5">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs opacity-60">🎙️ {vi.hud.voiceLocked}</p>
      <button
        type="button"
        onClick={() => set({ helpOpen: false })}
        className="mt-4 w-full rounded-full bg-[var(--ink)] py-2.5 font-semibold text-white"
      >
        {vi.hud.close}
      </button>
    </Modal>
  );
}

const COLORS = ["#a8d3d9", "#fde3a0", "#c5e3d3", "#f6c6cf", "#d6ccf2", "#ffd2b5"];
const STORE_KEY = "oii-bus:me";

function loadMe(): Me | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Me;
    return typeof v.nickname === "string" &&
      COLORS.includes(v.color) &&
      (HATS as readonly string[]).includes(v.hat)
      ? v
      : null;
  } catch {
    return null;
  }
}

function Creator() {
  const open = useUi((s) => s.creatorOpen);
  const me = useUi((s) => s.me);
  const set = useUi((s) => s.set);

  useEffect(() => {
    const saved = loadMe();
    const initial: Me = saved ?? {
      nickname: vi.creator.randomNames[Math.floor(Math.random() * vi.creator.randomNames.length)]!,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      hat: "non-la",
    };
    set({ me: initial });
    Object.assign(game.player, { nickname: initial.nickname, color: initial.color, hat: initial.hat });
  }, [set]);

  const update = (patch: Partial<Me>) => {
    const next = { ...useUi.getState().me, ...patch };
    set({ me: next });
    Object.assign(game.player, next);
  };

  if (!open) return null;
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div
        className="pop w-full max-w-md rounded-[28px] bg-[var(--cream)] p-5 text-[var(--ink)] shadow-2xl"
        data-testid="creator"
      >
        <h2 className="font-display text-2xl font-extrabold">{vi.creator.title} 👋</h2>
        <label htmlFor="nickname" className="mt-3 block text-xs font-bold tracking-wide uppercase opacity-60">
          {vi.creator.nickname}
        </label>
        <input
          id="nickname"
          value={me.nickname}
          maxLength={16}
          onChange={(e) => update({ nickname: e.target.value })}
          className="mt-1 w-full rounded-full bg-white px-4 py-2 text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <div className="mt-3 text-xs font-bold tracking-wide uppercase opacity-60">{vi.creator.color}</div>
        <div className="mt-1 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => update({ color: c })}
              className={`h-9 w-9 rounded-full shadow-sm transition-transform ${me.color === c ? "scale-110 ring-4 ring-white" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="mt-3 text-xs font-bold tracking-wide uppercase opacity-60">{vi.creator.hat}</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {HATS.map((h: Hat) => (
            <button
              key={h}
              type="button"
              onClick={() => update({ hat: h })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm ${me.hat === h ? "bg-[var(--ink)] text-white" : "bg-white"}`}
            >
              {vi.hats[h]}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-testid="go"
          onClick={() => {
            const nickname = me.nickname.trim() || vi.creator.randomNames[0];
            update({ nickname });
            try {
              localStorage.setItem(STORE_KEY, JSON.stringify({ ...me, nickname }));
            } catch {
              /* không lưu được cũng không sao */
            }
            set({ creatorOpen: false });
          }}
          className="font-display mt-4 w-full rounded-full bg-[var(--accent)] py-3 text-lg font-extrabold text-white shadow-md active:scale-[0.98]"
        >
          {vi.creator.go}
        </button>
      </div>
    </div>
  );
}
