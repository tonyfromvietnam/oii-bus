import { GESTURES } from "@xom-oii/shared";
import { useEffect, useRef, useState } from "react";
import { vi } from "../copy/vi";
import { gesture, interact, sendChat } from "../game/actions";
import { game } from "../game/state";
import { useUi, type LogEntry } from "../game/ui";
import { Joystick } from "./Joystick";

const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

export function Hud() {
  return (
    <div
      className="pointer-events-none absolute inset-0 select-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <TopBar />
      <ChatLog />
      <Toast />
      <BottomBar />
      {isTouch && <Joystick />}
      <Help />
    </div>
  );
}

function TopBar() {
  const clock = useUi((s) => s.clock);
  const wallet = useUi((s) => s.wallet);
  const setHelpOpen = useUi((s) => s.setHelpOpen);
  return (
    <div className="absolute top-0 right-0 left-0 flex items-start justify-between gap-2 p-3">
      <div className="rounded-2xl bg-black/45 px-3 py-2 text-white backdrop-blur-sm">
        <div className="text-sm font-semibold">
          {vi.appName} · <span className="text-lamp">{vi.streetName}</span>
        </div>
        <div className="mt-0.5 text-xs opacity-80">
          🕔 London {clock} · 🌧 {vi.hud.weather} · {vi.hud.wallet} £{wallet.toFixed(2)}
        </div>
        <div className="mt-1 text-[10px] opacity-60">{vi.hud.offlineBadge}</div>
      </div>
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        className="pointer-events-auto rounded-full bg-black/45 px-3 py-2 text-sm text-white backdrop-blur-sm"
      >
        ⌨️ {vi.hud.help}
      </button>
    </div>
  );
}

function ChatLog() {
  const log = useUi((s) => s.log);
  const visible = log.slice(-7);
  return (
    <div className="absolute top-24 right-3 flex w-[min(320px,60vw)] flex-col items-end gap-1 sm:top-20">
      {visible.map((e) => (
        <LogLine key={e.id} entry={e} />
      ))}
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const opacity = entry.band === "far" ? 0.55 : entry.band === "out" ? 0.35 : 1;
  const italic = entry.band === "system" || entry.band === "far";
  return (
    <div
      className="max-w-full rounded-xl bg-black/45 px-2.5 py-1 text-sm text-white backdrop-blur-sm"
      style={{ opacity, fontStyle: italic ? "italic" : undefined }}
    >
      <span className="font-semibold text-lamp">{entry.who}:</span> {entry.text}
    </div>
  );
}

function Toast() {
  const toast = useUi((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const id = setTimeout(() => setShown(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  if (!shown) return null;
  return (
    <div className="absolute bottom-40 left-1/2 w-[min(420px,86vw)] -translate-x-1/2 rounded-2xl bg-white/90 px-4 py-2 text-center text-sm text-slate-900 shadow-lg">
      {shown.text}
    </div>
  );
}

function BottomBar() {
  const prompt = useUi((s) => s.prompt);
  const chatOpen = useUi((s) => s.chatOpen);
  const setChatOpen = useUi((s) => s.setChatOpen);
  const [voiceTip, setVoiceTip] = useState(false);
  return (
    <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center gap-2 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {prompt && !chatOpen && (
        <button
          type="button"
          onClick={interact}
          className="pointer-events-auto rounded-full bg-lamp px-4 py-1.5 text-sm font-semibold text-slate-900 shadow"
          data-testid="prompt"
        >
          <kbd className="mr-1.5 rounded bg-slate-900/15 px-1.5">E</kbd>
          {prompt}
        </button>
      )}
      {chatOpen ? (
        <ChatInput onClose={() => setChatOpen(false)} />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {GESTURES.map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => gesture(g)}
              className="pointer-events-auto rounded-full bg-black/45 px-2.5 py-1.5 text-sm text-white backdrop-blur-sm"
              title={`${i + 1} · ${vi.gestures[g].label}`}
            >
              {vi.gestures[g].emoji}
              <span className="ml-1 hidden text-xs opacity-80 sm:inline">{vi.gestures[g].label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
          >
            💬 {vi.hud.chatButton}
          </button>
          <button
            type="button"
            onClick={() => {
              setVoiceTip(true);
              setTimeout(() => setVoiceTip(false), 3500);
            }}
            className="pointer-events-auto rounded-full bg-black/30 px-3 py-1.5 text-sm text-white/60 backdrop-blur-sm"
          >
            🎙️
          </button>
        </div>
      )}
      {voiceTip && (
        <div className="rounded-xl bg-black/60 px-3 py-1 text-xs text-white">{vi.hud.voiceLocked}</div>
      )}
      {isTouch && !chatOpen && (
        <button
          type="button"
          onClick={interact}
          className="pointer-events-auto absolute right-5 bottom-24 h-16 w-16 rounded-full bg-lamp/90 text-xl font-bold text-slate-900 shadow-lg"
        >
          E
        </button>
      )}
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
        ref={ref}
        value={text}
        maxLength={240}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        onBlur={() => setTimeout(onClose, 150)}
        placeholder={vi.hud.chatPlaceholder}
        className="flex-1 rounded-full bg-white/95 px-4 py-2 text-sm text-slate-900 outline-none"
      />
    </form>
  );
}

function Help() {
  const open = useUi((s) => s.helpOpen);
  const setHelpOpen = useUi((s) => s.setHelpOpen);
  if (!open) return null;
  const rows = isTouch ? vi.helpTouch : vi.helpDesktop;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setHelpOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-dusk/95 p-5 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-lamp">{vi.hud.help}</h2>
        <p className="mb-3 text-xs opacity-70">{vi.tagline}</p>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="py-1 pr-3 font-mono text-xs text-lamp">{k}</td>
                <td className="py-1 opacity-90">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setHelpOpen(false)}
          className="mt-4 w-full rounded-full bg-bus py-2 text-sm font-medium"
        >
          {vi.hud.close}
        </button>
      </div>
    </div>
  );
}
