import { CITIES, cityName, luckPercent, type CityId } from "@oii-bus/shared";
import { landmarkStatus } from "@oii-bus/world";
import { useEffect, useRef, useState } from "react";
import { viCity, viTemple } from "../copy/vi";
import { donate } from "../game/actions";
import { CITY_PEOPLE, createPlan, peopleIn, toggleJoin } from "../game/city";
import { cancelSearch, endSession, sendDm, startSearch } from "../game/match";
import { game } from "../game/state";
import { useUi } from "../game/ui";

const pill =
  "rounded-full bg-white/95 text-[var(--ink)] shadow-[0_2px_10px_rgba(31,45,77,0.10)] backdrop-blur-sm";
const primary =
  "rounded-full bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-40";
const ghost = "rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[var(--ink)] shadow-sm";
const field =
  "w-full rounded-xl bg-white px-3 py-2 text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-[var(--accent)]";
const label = "text-xs font-extrabold tracking-wide uppercase opacity-60";

/** Khi bus đi qua một thành phố: số người + kế hoạch ở đó. */
export function CityPassing() {
  const scene = useUi((s) => s.scene);
  const where = useUi((s) => s.where);
  const plans = useUi((s) => s.city.plans);
  const set = useUi((s) => s.set);
  if (scene !== "bus" || !where.now) return null;
  const lm = landmarkStatus(game.route).current;
  if (!lm) return null;
  const people = peopleIn(lm.city).length;
  const n = plans.filter((p) => p.city === lm.city).length;
  return (
    <button
      type="button"
      onClick={() => set({ city: { ...useUi.getState().city, open: true, view: lm.city } })}
      className={`${pill} pointer-events-auto px-3 py-1 text-sm font-semibold`}
      data-testid="city-passing"
    >
      {viCity.passing(cityName(lm.city), people, n)}
    </button>
  );
}

function Sheet({
  open,
  onClose,
  children,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-[var(--ink)]/25 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="pop flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-[var(--cream)] text-[var(--ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid={testId}
      >
        {children}
      </div>
    </div>
  );
}

export function DonatePanel() {
  const open = useUi((s) => s.donateOpen);
  const wallet = useUi((s) => s.wallet);
  const set = useUi((s) => s.set);
  return (
    <Sheet open={open} onClose={() => set({ donateOpen: false })}>
      <div className="flex flex-col gap-3 p-5">
        <h2 className="text-2xl font-black">🧧 {viTemple.donateTitle}</h2>
        <p className="text-sm opacity-75">{viTemple.donateBody}</p>
        <div className="flex gap-2">
          {[1, 2, 5, 10].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => donate(a)}
              disabled={wallet < a}
              className={`${primary} flex-1`}
            >
              £{a}
            </button>
          ))}
        </div>
        <p className="text-xs opacity-60">💷 £{wallet.toFixed(2)}</p>
      </div>
    </Sheet>
  );
}

export function SeDuyenPanel() {
  const d = useUi((s) => s.duyen);
  const merit = useUi((s) => s.merit);
  const set = useUi((s) => s.set);
  const t = viTemple.seDuyen;
  const close = () => set({ duyen: { ...useUi.getState().duyen, open: false } });
  const patch = (p: Partial<typeof d>) => set({ duyen: { ...useUi.getState().duyen, ...p } });

  return (
    <Sheet open={d.open} onClose={close} testId="seduyen">
      {d.step === "intro" && (
        <div className="flex flex-col gap-3 overflow-y-auto p-5">
          <h2 className="text-2xl font-black">{t.title}</h2>
          <p className="text-sm opacity-75">{t.body}</p>
          <div className="rounded-2xl bg-[var(--mint)] px-3 py-2 text-sm">
            🪷 {viTemple.merit}: <b>{merit}</b> · {viTemple.luck}: <b>+{luckPercent(merit)}%</b>
            <div className="mt-1 text-xs opacity-70">{viTemple.meritHint}</div>
          </div>
          <div className={label}>{t.iAm}</div>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => patch({ gender: g })}
                className={`flex-1 rounded-full py-2 font-bold shadow-sm ${d.gender === g ? "bg-[var(--ink)] text-white" : "bg-white"}`}
              >
                {g === "male" ? t.male : t.female}
              </button>
            ))}
          </div>
          <div className={label}>{t.seeking}</div>
          <div className="flex gap-2">
            {(["opposite", "any"] as const).map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => patch({ seeking: sk })}
                className={`flex-1 rounded-full py-2 text-sm font-bold shadow-sm ${d.seeking === sk ? "bg-[var(--ink)] text-white" : "bg-white"}`}
              >
                {sk === "opposite" ? t.opposite : t.any}
              </button>
            ))}
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs opacity-75">
            {t.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <button
            type="button"
            data-testid="seduyen-go"
            className={primary}
            onClick={() =>
              d.gender ? startSearch(d.gender, d.seeking) : useUi.getState().showToast(t.needGender)
            }
          >
            {t.go}
          </button>
        </div>
      )}
      {d.step === "searching" && (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="thread text-5xl">🧶</div>
          <div className="text-lg font-black">{t.searching}</div>
          <div className="text-sm opacity-70">{t.searchingSub}</div>
          <button type="button" className={ghost} onClick={cancelSearch}>
            {t.cancel}
          </button>
        </div>
      )}
      {(d.step === "chat" || d.step === "ended") && <DmChat />}
    </Sheet>
  );
}

function DmChat() {
  const d = useUi((s) => s.duyen);
  const set = useUi((s) => s.set);
  const t = viTemple.seDuyen;
  const [text, setText] = useState("");
  const [now, setNow] = useState(Date.now());
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [d.messages.length, d.typing]);
  const left = Math.max(0, Math.floor((d.endsAt - now) / 1000));
  const mm = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  return (
    <div className="flex h-[min(560px,80vh)] flex-col" data-testid="dm">
      <div className="flex items-center gap-2 border-b border-black/5 bg-white/70 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-black">💞 {d.partner?.name ?? "…"}</div>
          <div className="text-xs opacity-60">
            📍 {d.partner ? cityName(d.partner.city) : ""} · {t.demo}
          </div>
        </div>
        {d.step === "chat" && (
          <span className="rounded-full bg-[var(--mint)] px-2 py-0.5 text-xs font-bold tabular-nums">
            ⏳ {mm}
          </span>
        )}
      </div>
      <div ref={list} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {d.messages.map((m) =>
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
        {d.typing && <div className="self-start text-xs opacity-60">{t.typing}</div>}
      </div>
      {d.step === "chat" ? (
        <>
          <form
            className="flex gap-2 px-3 pb-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (sendDm(text)) setText("");
            }}
          >
            <input
              id="dm"
              value={text}
              maxLength={240}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              className={field}
            />
            <button type="submit" className={primary}>
              ➤
            </button>
          </form>
          <div className="flex justify-center gap-2 px-3 pb-4">
            <button type="button" className={ghost} onClick={() => endSession("end")}>
              {t.end}
            </button>
            <button type="button" className={ghost} onClick={() => endSession("block")}>
              🚫 {t.block}
            </button>
            <button type="button" className={ghost} onClick={() => endSession("report")}>
              ⚠️ {t.report}
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center gap-2 px-3 pb-4">
          <button
            type="button"
            className={primary}
            onClick={() => set({ duyen: { ...useUi.getState().duyen, step: "intro" } })}
          >
            {t.again}
          </button>
        </div>
      )}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

export function CityPanel() {
  const c = useUi((s) => s.city);
  const set = useUi((s) => s.set);
  const patch = (p: Partial<typeof c>) => set({ city: { ...useUi.getState().city, ...p } });
  const view: CityId | null = c.view ?? c.home;
  const [form, setForm] = useState({ title: "", date: today(), time: "18:00", maxPeople: 6, note: "" });
  const [visitCity, setVisitCity] = useState<CityId | "">("");
  const [visitFrom, setVisitFrom] = useState(today());

  const myCities = new Set<CityId>([...(c.home ? [c.home] : []), ...c.visiting.map((v) => v.city)]);
  const plans = [...c.plans].sort(
    (a, b) => Number(myCities.has(b.city)) - Number(myCities.has(a.city)) || a.date.localeCompare(b.date),
  );
  const shownPlans = view ? plans.filter((p) => p.city === view) : plans;
  const people = view
    ? CITY_PEOPLE.filter((p) => p.city === view)
    : CITY_PEOPLE.filter((p) => myCities.has(p.city));

  return (
    <Sheet open={c.open} onClose={() => patch({ open: false })} testId="city">
      <div className="flex flex-col gap-3 overflow-y-auto p-5">
        <h2 className="text-2xl font-black">{viCity.title}</h2>
        <p className="text-sm opacity-75">{viCity.body}</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className={label}>{viCity.myCity}</span>
            <select
              id="home-city"
              className={field}
              value={c.home ?? ""}
              onChange={(e) =>
                patch({
                  home: (e.target.value || null) as CityId | null,
                  view: (e.target.value || null) as CityId | null,
                })
              }
            >
              <option value="">{viCity.choose}</option>
              {CITIES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={label}>{viCity.visiting}</span>
            <div className="flex gap-1">
              <select
                id="visit-city"
                className={field}
                value={visitCity}
                onChange={(e) => setVisitCity(e.target.value as CityId | "")}
              >
                <option value="">—</option>
                {CITIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
        {visitCity && (
          <div className="flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className={label}>{viCity.from}</span>
              <input
                id="visit-from"
                type="date"
                className={field}
                value={visitFrom}
                onChange={(e) => setVisitFrom(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={primary}
              onClick={() => {
                patch({
                  visiting: [...c.visiting, { city: visitCity, from: visitFrom, to: visitFrom }].slice(-5),
                  view: visitCity,
                });
                setVisitCity("");
              }}
            >
              {viCity.addVisit}
            </button>
          </div>
        )}
        {c.visiting.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {c.visiting.map((v, i) => (
              <span key={i} className="rounded-full bg-[var(--mint)] px-2 py-0.5 text-xs font-semibold">
                ✈️ {viCity.visitingCity(cityName(v.city), v.from)}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => patch({ view: null })}
            className={`rounded-full px-3 py-1 text-xs font-bold ${view === null ? "bg-[var(--ink)] text-white" : "bg-white"}`}
          >
            Tất cả
          </button>
          {[...new Set([...myCities, ...(c.view ? [c.view] : [])])].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => patch({ view: id })}
              className={`rounded-full px-3 py-1 text-xs font-bold ${view === id ? "bg-[var(--ink)] text-white" : "bg-white"}`}
            >
              📍 {cityName(id)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
          {(["plans", "people"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => patch({ tab })}
              className={`flex-1 rounded-full py-1.5 text-sm font-bold ${c.tab === tab ? "bg-[var(--accent)] text-white" : ""}`}
            >
              {viCity.tabs[tab]}
            </button>
          ))}
        </div>

        {c.tab === "people" ? (
          <ul className="flex flex-col gap-2">
            {people.length === 0 && <li className="text-sm opacity-60">{viCity.noPeople}</li>}
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
                <span className="h-8 w-8 rounded-full" style={{ background: p.color }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs opacity-60">
                    {p.visiting
                      ? viCity.visitingCity(cityName(p.city), p.visiting)
                      : viCity.livesIn(cityName(p.city))}
                  </div>
                </div>
                <button
                  type="button"
                  className={ghost}
                  disabled={c.waved.includes(p.id)}
                  onClick={() => patch({ waved: [...c.waved, p.id] })}
                >
                  {c.waved.includes(p.id) ? viCity.waved : viCity.wave}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="flex flex-col gap-2" data-testid="plans">
              {shownPlans.map((p) => {
                const inIt = p.members.includes("me");
                const full = !inIt && p.members.length >= p.maxPeople;
                return (
                  <li key={p.id} className="rounded-2xl bg-white px-3 py-2.5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold">{p.title}</div>
                        <div className="text-xs opacity-70">
                          📍 {cityName(p.city)} · 📅 {p.date} · 🕒 {p.time} · 👥{" "}
                          {viCity.members(p.members.length, p.maxPeople)}
                        </div>
                        {p.note && <div className="mt-0.5 text-xs opacity-70">{p.note}</div>}
                        <div className="mt-0.5 text-[11px] opacity-50">
                          {p.by}
                          {p.example ? ` · ${viCity.example}` : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={inIt ? ghost : primary}
                        disabled={full}
                        onClick={() => toggleJoin(p.id)}
                      >
                        {inIt ? viCity.leave : full ? viCity.full : viCity.join}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <form
              className="flex flex-col gap-2 rounded-2xl bg-[var(--mint)] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                const city = view ?? c.home;
                if (createPlan({ ...form, city })) setForm({ ...form, title: "", note: "" });
              }}
            >
              <div className="font-black">➕ {viCity.createTitle}</div>
              <input
                id="plan-title"
                className={field}
                placeholder={viCity.planTitlePh}
                value={form.title}
                maxLength={60}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  id="plan-date"
                  type="date"
                  className={field}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  aria-label={viCity.date}
                />
                <input
                  id="plan-time"
                  type="time"
                  className={field}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  aria-label={viCity.time}
                />
                <input
                  id="plan-max"
                  type="number"
                  min={2}
                  max={12}
                  className={field}
                  value={form.maxPeople}
                  onChange={(e) => setForm({ ...form, maxPeople: Number(e.target.value) })}
                  aria-label={viCity.maxPeople}
                />
              </div>
              <input
                id="plan-note"
                className={field}
                placeholder={viCity.notePh}
                value={form.note}
                maxLength={200}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <div className="text-xs opacity-70">
                📍 {view || c.home ? cityName((view ?? c.home)!) : viCity.choose}
              </div>
              <button type="submit" className={primary} data-testid="plan-create">
                {viCity.create}
              </button>
            </form>
          </>
        )}
        <p className="text-xs opacity-60">🛡️ {viCity.safety}</p>
      </div>
    </Sheet>
  );
}
