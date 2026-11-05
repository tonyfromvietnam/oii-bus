import { levelFor, pickForDay, zoneLabel } from "@oii-bus/shared";
import { useState } from "react";
import { DAILY_QUOTES, NEWCOMER_TASKS, viDaily } from "../copy/daily";
import { inviteUrl, toggleNewcomer, useProgress } from "../game/progress";
import { useUi } from "../game/ui";
import { drawShareCard } from "./shareCard";

const pill =
  "rounded-full bg-white/95 text-[var(--ink)] shadow-[0_2px_10px_rgba(31,45,77,0.10)] backdrop-blur-sm";
const primary =
  "rounded-full bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-40";
const ghost = "rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[var(--ink)] shadow-sm";

/** Chip ở góc trên: chuỗi ngày + cấp. Bấm để mở hồ sơ. */
export function ProfileChip() {
  const streak = useProgress((s) => s.streak.days);
  const xp = useProgress((s) => s.xp);
  const set = useProgress((s) => s.set);
  const lv = levelFor(xp);
  return (
    <button
      type="button"
      onClick={() => set({ open: true })}
      className={`${pill} pointer-events-auto flex h-10 items-center gap-1.5 px-3 text-sm font-bold`}
      data-testid="profile-chip"
      aria-label={viDaily.profileTitle}
    >
      <span>🔥 {Math.max(1, streak)}</span>
      <span className="h-4 w-px bg-black/15" />
      <span className="text-[var(--accent)]">{zoneLabel(lv.zone)}</span>
    </button>
  );
}

export function ProfilePanel() {
  const open = useProgress((s) => s.open);
  const tab = useProgress((s) => s.tab);
  const set = useProgress((s) => s.set);
  if (!open) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-[var(--ink)]/25 p-3 sm:items-center"
      onClick={() => set({ open: false })}
    >
      <div
        className="pop flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-[var(--cream)] text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="profile"
      >
        <div className="flex gap-1 p-3 pb-0">
          {(["today", "newcomer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set({ tab: t })}
              className={`flex-1 rounded-full py-2 text-sm font-bold ${tab === t ? "bg-[var(--ink)] text-white" : "bg-white"}`}
            >
              {viDaily.tabs[t]}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto p-5 pt-4">{tab === "today" ? <Today /> : <Newcomer />}</div>
      </div>
    </div>
  );
}

function Today() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const today = useProgress((s) => s.today);
  const me = useUi((s) => s.me);
  const lv = levelFor(xp);
  const quote = pickForDay(DAILY_QUOTES, today.day);
  const [card, setCard] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const invite = inviteUrl();

  const make = async () => {
    const cv = await drawShareCard({
      nickname: me.nickname,
      color: me.color,
      streak: Math.max(1, streak.days),
      xp,
      today,
      quote,
      invite,
    });
    setCard(cv.toDataURL("image/png"));
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invite);
      setCopyMsg(viDaily.copied);
    } catch {
      setCopyMsg(viDaily.copyFailed);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1 rounded-2xl bg-white p-3 text-center shadow-sm">
          <div className="text-3xl font-black">🔥 {Math.max(1, streak.days)}</div>
          <div className="text-xs font-semibold opacity-70">{viDaily.streak}</div>
          <div className="mt-0.5 text-[11px] opacity-50">{viDaily.best(Math.max(1, streak.best))}</div>
        </div>
        <div
          className="flex-1 rounded-2xl bg-[var(--accent)] p-3 text-center text-white shadow-sm"
          data-testid="level"
        >
          <div className="text-2xl font-black">{zoneLabel(lv.zone)}</div>
          <div className="text-xs font-semibold opacity-90">{lv.zone.title}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/30">
            <div className="h-full rounded-full bg-[var(--sun)]" style={{ width: `${lv.progress * 100}%` }} />
          </div>
          <div className="mt-1 text-[11px] opacity-90">
            {lv.next ? viDaily.xpToNext(lv.xpToNext, zoneLabel(lv.next)) : viDaily.maxLevel}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs font-extrabold tracking-wide uppercase opacity-60">
          {viDaily.todayTitle}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["⏱️", today.focusMinutes, viDaily.stats.focus],
              ["🪔", today.incense, viDaily.stats.incense],
              ["✅", today.done, viDaily.stats.stamps],
            ] as const
          ).map(([icon, n, label]) => (
            <div key={label} className="rounded-2xl bg-white p-2 text-center shadow-sm">
              <div className="text-xl font-black">
                {icon} {n}
              </div>
              <div className="text-[11px] font-semibold opacity-70">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border-2 border-[var(--blue)] bg-white px-4 py-3">
        <div className="text-xs font-extrabold tracking-wide uppercase opacity-60">{viDaily.quoteTitle}</div>
        <p className="mt-1 text-[15px] font-semibold italic">“{quote}”</p>
      </div>
      {card ? (
        <div className="flex flex-col items-center gap-2" data-testid="share-card">
          <img src={card} alt={viDaily.cardTitle} className="w-full max-w-[300px] rounded-2xl shadow-md" />
          <p className="text-center text-xs opacity-60">{viDaily.cardHint}</p>
          <div className="flex gap-2">
            <a className={ghost} href={card} download="oii-bus-hom-nay.png">
              ⬇️ {viDaily.download}
            </a>
            <button type="button" className={ghost} onClick={copy}>
              🔗 {viDaily.copyInvite}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={primary} onClick={make} data-testid="make-card">
          {viDaily.makeCard}
        </button>
      )}
      {copyMsg && <p className="text-center text-xs font-semibold">{copyMsg}</p>}
      <div className="rounded-xl bg-[var(--mint)] px-3 py-2 text-xs">
        <div className="font-bold">{viDaily.inviteNote}</div>
        <input
          id="invite-link"
          readOnly
          value={invite}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-1 w-full rounded-lg bg-white px-2 py-1 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}

function Newcomer() {
  const done = useProgress((s) => s.newcomer);
  const count = NEWCOMER_TASKS.filter((t) => done[t.id]).length;
  const total = NEWCOMER_TASKS.length;
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3" data-testid="newcomer">
      <div>
        <h2 className="text-xl font-black">{viDaily.newcomer.title}</h2>
        <p className="text-sm opacity-70">{viDaily.newcomer.intro}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums">{viDaily.newcomer.done(count, total)}</span>
        </div>
        {count === total && (
          <p className="mt-2 text-sm font-bold text-[var(--accent)]">{viDaily.newcomer.complete}</p>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {NEWCOMER_TASKS.map((t) => {
          const checked = !!done[t.id];
          const expanded = openId === t.id;
          return (
            <li key={t.id} className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input
                  id={`nc-${t.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleNewcomer(t.id)}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                <label
                  htmlFor={`nc-${t.id}`}
                  className={`flex-1 text-sm font-bold ${checked ? "line-through opacity-50" : ""}`}
                >
                  {t.icon} {t.title}
                </label>
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : t.id)}
                  className="rounded-full px-2 text-lg opacity-60"
                  aria-expanded={expanded}
                  aria-label={t.title}
                >
                  {expanded ? "−" : "+"}
                </button>
              </div>
              {expanded && (
                <div className="px-4 pb-3 text-sm">
                  <p className="opacity-80">{t.tip}</p>
                  {t.link && (
                    <a
                      className="mt-1 inline-block font-bold text-[var(--accent)] underline"
                      href={t.link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {viDaily.newcomer.learnMore}: {t.link.label} ↗
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] opacity-50">{viDaily.newcomer.disclaimer}</p>
    </div>
  );
}
