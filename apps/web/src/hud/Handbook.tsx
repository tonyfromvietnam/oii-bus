import { placeSpot } from "@oii-bus/world";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHAPTERS,
  PLACES,
  QA,
  TOPICS,
  viHandbook,
  type OrderQuest,
  type PickQuest,
  type Quest,
  type QuizQuest,
  type TopicId,
} from "../copy/handbook";
import { goToScene } from "../game/actions";
import {
  activeQuests,
  completeQuest,
  currentState,
  devSkipWait,
  floorUnlocked,
  sendBuddyMessage,
  useHandbook,
} from "../game/handbook";
import { game } from "../game/state";
import { ui, useUi } from "../game/ui";

const pill =
  "rounded-full bg-white/95 text-[var(--ink)] shadow-[0_2px_10px_rgba(31,45,77,0.10)] backdrop-blur-sm";
const primary =
  "rounded-full bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-40";
const ghost = "rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[var(--ink)] shadow-sm";
const TYPE_ICON: Record<Quest["type"], string> = {
  quiz: "❓",
  order: "🔢",
  pick: "☑️",
  buddy: "🤝",
  duo: "👫",
  chat: "💬",
  wave: "👋",
  duyen: "💞",
};

function useHb() {
  // đăng ký lại khi tiến độ đổi
  useHandbook((s) => s.done);
  useHandbook((s) => s.chapterDoneOn);
  useHandbook((s) => s.buddy);
  return currentState();
}

/** Đi tới nơi làm nhiệm vụ: đổi tầng nếu cần rồi tự đi tới. */
export function goToQuest(q: Quest) {
  const hb = useHandbook.getState();
  if (q.type === "chat") return hb.set({ chatOpen: true, open: false });
  if (q.type === "wave") return ui().showToast((q as { hint: string }).hint);
  if (q.type === "duyen") {
    if (!floorUnlocked("temple")) return ui().showToast(viHandbook.locked(4));
    hb.set({ open: false });
    if (game.scene !== "temple") goToScene("temple");
    return;
  }
  if (!q.place) return;
  hb.set({ open: false });
  const s = placeSpot(q.place);
  const walk = () => (game.input.moveTarget = { x: s.x, z: s.z + 0.4 });
  if (game.scene !== "street") {
    goToScene("street");
    setTimeout(walk, 700);
  } else walk();
}

export function QuestTracker() {
  const st = useHb();
  const done = useHandbook((s) => s.done);
  const set = useHandbook((s) => s.set);
  const creator = useUi((s) => s.creatorOpen);
  if (creator) return null;
  if (st.kind !== "active") {
    return (
      <button
        type="button"
        onClick={() => set({ open: true })}
        className={`${pill} pointer-events-auto absolute top-[72px] left-3 max-w-[260px] px-3 py-2 text-left text-xs font-semibold`}
      >
        📘 {st.kind === "finished" ? viHandbook.finished : viHandbook.waiting(st.opensOn)}
      </button>
    );
  }
  const ch = CHAPTERS[st.chapter]!;
  const n = ch.quests.filter((q) => done.includes(q.id)).length;
  return (
    <div
      className="pointer-events-auto absolute top-[72px] left-3 w-[min(270px,62vw)] rounded-2xl bg-white/95 p-2.5 text-[var(--ink)] shadow-md"
      data-testid="tracker"
    >
      <button
        type="button"
        onClick={() => set({ open: true })}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-black">
          {ch.icon} {viHandbook.today(ch.day, ch.title)}
        </span>
        <span className="text-[11px] font-bold text-[var(--accent)]">{n}/3</span>
      </button>
      <ul className="mt-1.5 flex flex-col gap-1">
        {ch.quests.map((q) => {
          const ok = done.includes(q.id);
          return (
            <li key={q.id}>
              <button
                type="button"
                disabled={ok}
                onClick={() => goToQuest(q)}
                className={`flex w-full items-center gap-2 rounded-xl px-2 py-1 text-left text-xs ${ok ? "opacity-50" : "bg-[var(--mint)] hover:brightness-95"}`}
              >
                <span>{ok ? "✅" : TYPE_ICON[q.type]}</span>
                <span className={`flex-1 font-semibold ${ok ? "line-through" : ""}`}>{q.title}</span>
                {!ok && q.place && <span className="text-[10px] opacity-60">{PLACES[q.place].icon}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HandbookPanel() {
  const open = useHandbook((s) => s.open);
  const set = useHandbook((s) => s.set);
  const [tab, setTab] = useState<"journey" | "qa">("journey");
  if (!open) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-[var(--ink)]/25 p-3 sm:items-center"
      onClick={() => set({ open: false })}
    >
      <div
        className="pop flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-[var(--cream)] text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="handbook"
      >
        <div className="flex gap-1 p-3 pb-0">
          {(["journey", "qa"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-sm font-bold ${tab === t ? "bg-[var(--ink)] text-white" : "bg-white"}`}
            >
              {t === "journey" ? viHandbook.title : `💡 ${viHandbook.qaTitle}`}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto p-5 pt-4">{tab === "journey" ? <Journey /> : <QaBank />}</div>
      </div>
    </div>
  );
}

function Journey() {
  const st = useHb();
  const done = useHandbook((s) => s.done);
  const current = st.kind === "finished" ? CHAPTERS.length : st.chapter;
  return (
    <div className="flex flex-col gap-2">
      {st.kind === "waiting" && (
        <div className="rounded-2xl bg-[var(--mint)] p-3 text-sm">
          <div className="font-bold">⏳ {viHandbook.waiting(st.opensOn)}</div>
          <button
            type="button"
            onClick={devSkipWait}
            className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-bold"
            data-testid="dev-skip"
          >
            {viHandbook.devSkip}
          </button>
        </div>
      )}
      {st.kind === "finished" && (
        <div className="rounded-2xl bg-[var(--mint)] p-3 text-sm font-bold">{viHandbook.finished}</div>
      )}
      {CHAPTERS.map((ch, i) => {
        const n = ch.quests.filter((q) => done.includes(q.id)).length;
        const locked = i > current || (i === current && st.kind === "waiting");
        const isNow = i === current && st.kind === "active";
        return (
          <div
            key={ch.day}
            className={`rounded-2xl p-3 shadow-sm ${isNow ? "bg-white ring-2 ring-[var(--accent)]" : "bg-white"} ${locked ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{locked ? "🔒" : n === 3 ? "✅" : ch.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black">{viHandbook.today(ch.day, ch.title)}</div>
                <div className="text-[11px] opacity-70">{ch.unlock}</div>
              </div>
              <span className="text-xs font-bold tabular-nums">{n}/3</span>
            </div>
            {isNow && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {ch.quests.map((q) => {
                  const ok = done.includes(q.id);
                  return (
                    <li
                      key={q.id}
                      className="flex items-center gap-2 rounded-xl bg-[var(--mint)] px-2 py-1.5 text-xs"
                    >
                      <span>{ok ? "✅" : TYPE_ICON[q.type]}</span>
                      <span className={`flex-1 font-semibold ${ok ? "line-through opacity-60" : ""}`}>
                        {q.title}
                      </span>
                      {!ok && (
                        <button
                          type="button"
                          className="rounded-full bg-[var(--accent)] px-2 py-0.5 font-bold text-white"
                          onClick={() => goToQuest(q)}
                        >
                          {viHandbook.go}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QaBank() {
  const [topic, setTopic] = useState<TopicId>("pre");
  const [openQ, setOpenQ] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2" data-testid="qa">
      <p className="text-sm opacity-70">{viHandbook.qaIntro}</p>
      <div className="flex flex-wrap gap-1">
        {(Object.keys(TOPICS) as TopicId[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${topic === t ? "bg-[var(--ink)] text-white" : "bg-white"}`}
          >
            {TOPICS[t]}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {QA.filter((x) => x.topic === topic).map((x) => (
          <li key={x.q} className="rounded-2xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpenQ(openQ === x.q ? null : x.q)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm font-bold"
              aria-expanded={openQ === x.q}
            >
              <span className="flex-1">{x.q}</span>
              <span className="opacity-50">{openQ === x.q ? "−" : "+"}</span>
            </button>
            {openQ === x.q && <p className="px-3 pb-3 text-sm opacity-80">{x.a}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------ hộp thoại nhiệm vụ
export function QuestDialog() {
  const quest = useHandbook((s) => s.quest);
  const set = useHandbook((s) => s.set);
  const [solved, setSolved] = useState(false);
  useEffect(() => setSolved(false), [quest?.id]);
  if (!quest) return null;
  const close = () => set({ quest: null });
  const win = () => {
    completeQuest(quest.id);
    setSolved(true);
  };
  const npc = quest.place ? PLACES[quest.place] : null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-[var(--ink)]/25 p-3 sm:items-center"
      onClick={close}
    >
      <div
        className="pop w-full max-w-md rounded-[28px] bg-[var(--cream)] p-5 text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="quest"
      >
        {npc && (
          <div className="mb-2 flex items-start gap-2">
            <span className="text-2xl">{npc.icon}</span>
            <div className="say flex-1 text-sm">
              <b>{npc.npc}:</b> {npc.hello}
            </div>
          </div>
        )}
        <h2 className="text-lg font-black">{quest.title}</h2>
        {solved ? (
          <div className="mt-2 flex flex-col gap-3">
            <div className="rounded-2xl bg-[var(--mint)] p-3 text-sm">
              <div className="font-black">✅ {viHandbook.done}!</div>
              <p className="mt-1">{quest.explain}</p>
              {quest.link && (
                <a
                  className="mt-1 inline-block font-bold text-[var(--accent)] underline"
                  href={quest.link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {viHandbook.learnMore}: {quest.link.label} ↗
                </a>
              )}
            </div>
            <button type="button" className={primary} onClick={close} data-testid="quest-close">
              {viHandbook.close}
            </button>
          </div>
        ) : quest.type === "quiz" ? (
          <Quiz q={quest} onWin={win} />
        ) : quest.type === "order" ? (
          <Order q={quest} onWin={win} />
        ) : quest.type === "pick" ? (
          <Pick q={quest} onWin={win} />
        ) : null}
      </div>
    </div>
  );
}

function Quiz({ q, onWin }: { q: QuizQuest; onWin: () => void }) {
  const [wrong, setWrong] = useState<number[]>([]);
  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="text-sm font-semibold">{q.question}</p>
      {q.options.map((o, i) => (
        <button
          key={o}
          type="button"
          disabled={wrong.includes(i)}
          onClick={() => (i === q.answer ? onWin() : setWrong([...wrong, i]))}
          className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold shadow-sm ${wrong.includes(i) ? "bg-red-100 line-through opacity-60" : "bg-white hover:bg-[var(--mint)]"}`}
        >
          {o}
        </button>
      ))}
      {wrong.length > 0 && <p className="text-xs font-bold text-red-600">{viHandbook.wrong}</p>}
    </div>
  );
}

function Order({ q, onWin }: { q: OrderQuest; onWin: () => void }) {
  const shuffled = useMemo(() => {
    const a = q.steps.map((s, i) => ({ s, i }));
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a[k], a[j]] = [a[j]!, a[k]!];
    }
    if (a.every((x, i) => x.i === i)) a.reverse();
    return a;
  }, [q]);
  const [picked, setPicked] = useState<number[]>([]);
  const [bad, setBad] = useState(false);
  const tap = (i: number) => {
    if (picked.includes(i)) return;
    const next = [...picked, i];
    if (i !== picked.length) {
      setBad(true);
      setTimeout(() => {
        setPicked([]);
        setBad(false);
      }, 700);
      setPicked(next);
      return;
    }
    setPicked(next);
    if (next.length === q.steps.length) setTimeout(onWin, 300);
  };
  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="text-sm font-semibold">{q.prompt}</p>
      <p className="text-xs opacity-60">{viHandbook.orderHint}</p>
      {shuffled.map(({ s, i }) => {
        const pos = picked.indexOf(i);
        return (
          <button
            key={s}
            type="button"
            onClick={() => tap(i)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold shadow-sm ${pos >= 0 ? (bad && pos === picked.length - 1 ? "bg-red-100" : "bg-[var(--mint)]") : "bg-white"}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ink)] text-xs text-white">
              {pos >= 0 ? pos + 1 : "·"}
            </span>
            {s}
          </button>
        );
      })}
      {bad && <p className="text-xs font-bold text-red-600">{viHandbook.wrong}</p>}
    </div>
  );
}

function Pick({ q, onWin }: { q: PickQuest; onWin: () => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const [bad, setBad] = useState(false);
  const yellow = q.id === "d5-yellow";
  const check = () => {
    const ok = q.options.every((o, i) => o.ok === sel.includes(i));
    if (ok) onWin();
    else setBad(true);
  };
  return (
    <div className="mt-2 flex flex-col gap-2">
      <p className="text-sm font-semibold">{q.prompt}</p>
      <div className={yellow ? "grid grid-cols-3 gap-2" : "flex flex-col gap-1.5"}>
        {q.options.map((o, i) => {
          const on = sel.includes(i);
          return (
            <button
              key={o.text}
              type="button"
              onClick={() => {
                setBad(false);
                setSel(on ? sel.filter((x) => x !== i) : [...sel, i]);
              }}
              className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold shadow-sm ${on ? "bg-[var(--accent)] text-white" : "bg-white"}`}
              aria-pressed={on}
            >
              {yellow ? (
                <span className="flex flex-col items-center gap-1 text-center">
                  <span className="text-2xl">{["🍗", "🍞", "🐟", "🥛", "🥗", "🍎"][i]}</span>
                  <span className="text-xs">{o.text}</span>
                  <span
                    className={`rounded px-1.5 text-[11px] font-black ${o.ok ? "bg-[#ffe14a] text-[var(--ink)]" : "bg-black/10"}`}
                  >
                    {o.tag}
                  </span>
                </span>
              ) : (
                <>
                  {on ? "☑️ " : "⬜ "}
                  {o.text}
                </>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs opacity-60">{viHandbook.pickHint}</p>
      {bad && <p className="text-xs font-bold text-red-600">{viHandbook.wrong}</p>}
      <button
        type="button"
        className={primary}
        onClick={check}
        disabled={sel.length === 0}
        data-testid="pick-check"
      >
        {viHandbook.check}
      </button>
    </div>
  );
}

// ------------------------------------------------------------ bạn đồng hành
export function BuddyButton() {
  const buddy = useHandbook((s) => s.buddy);
  const chat = useHandbook((s) => s.chat);
  const set = useHandbook((s) => s.set);
  const seen = useRef(chat.length);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const open = useHandbook.getState().chatOpen;
    if (open) seen.current = chat.length;
    setUnread(Math.max(0, chat.length - seen.current));
  }, [chat.length]);
  if (!buddy) return null;
  return (
    <button
      type="button"
      onClick={() => {
        seen.current = chat.length;
        setUnread(0);
        set({ chatOpen: true });
      }}
      className={`${pill} pointer-events-auto relative h-10 px-3 text-sm font-bold`}
      data-testid="buddy-button"
      aria-label={`Chat với ${buddy.name}`}
    >
      🤝 {buddy.name}
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-white">
          {unread}
        </span>
      )}
    </button>
  );
}

export function BuddyChat() {
  const open = useHandbook((s) => s.chatOpen);
  const buddy = useHandbook((s) => s.buddy);
  const chat = useHandbook((s) => s.chat);
  const set = useHandbook((s) => s.set);
  const [text, setText] = useState("");
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [chat.length, open]);
  if (!open || !buddy) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-[var(--ink)]/25 p-3 sm:items-center"
      onClick={() => set({ chatOpen: false })}
    >
      <div
        className="pop flex h-[min(520px,80vh)] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-[var(--cream)] text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="buddy-chat"
      >
        <div className="flex items-center gap-2 border-b border-black/5 bg-white/70 px-4 py-3">
          <span className="h-8 w-8 rounded-full" style={{ background: buddy.color }} aria-hidden />
          <div className="flex-1">
            <div className="font-black">🤝 {buddy.name}</div>
            <div className="text-xs opacity-60">{buddy.uni} · bạn đồng hành (bản thử: bot)</div>
          </div>
          <button type="button" className={ghost} onClick={() => set({ chatOpen: false })}>
            ✕
          </button>
        </div>
        <div ref={list} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
          {chat.map((m) =>
            m.from === "system" ? (
              <div
                key={m.id}
                className="self-center rounded-full bg-[var(--mint)] px-3 py-1 text-center text-xs"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[15px] ${m.from === "me" ? "self-end bg-[var(--accent)] text-white" : "self-start border-2 border-[var(--blue)] bg-white"}`}
              >
                {m.text}
              </div>
            ),
          )}
        </div>
        <form
          className="flex gap-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (sendBuddyMessage(text)) setText("");
          }}
        >
          <input
            id="buddy-input"
            value={text}
            maxLength={240}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhắn cho bạn đồng hành…"
            className="w-full rounded-xl bg-white px-3 py-2 text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button type="submit" className={primary}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

export function MatchingOverlay() {
  const matching = useHandbook((s) => s.matching);
  if (!matching) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-[var(--ink)]/25 p-3">
      <div className="pop flex flex-col items-center gap-2 rounded-[28px] bg-[var(--cream)] p-8 text-center text-[var(--ink)] shadow-2xl">
        <div className="thread text-5xl">🤝</div>
        <div className="text-lg font-black">Đang tìm bạn đồng hành…</div>
        <div className="text-sm opacity-70">Ghép ngẫu nhiên với một bạn mới sang như bạn.</div>
      </div>
    </div>
  );
}

/** Số nhiệm vụ còn lại hôm nay (cho nút chính). */
export function useTodayCount(): number {
  const st = useHb();
  const done = useHandbook((s) => s.done);
  if (st.kind !== "active") return 3;
  return CHAPTERS[st.chapter]!.quests.filter((q) => done.includes(q.id)).length;
}

export { activeQuests };
