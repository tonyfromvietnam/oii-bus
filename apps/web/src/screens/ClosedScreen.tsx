import { useEffect, useState } from "react";
import { vi } from "../copy/vi";
import { formatCountdown } from "../lib/countdown";

export function ClosedScreen({ nextOpeningAt }: { nextOpeningAt: string }) {
  const target = new Date(nextOpeningAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold text-lamp">{vi.closed.title}</h1>
      <p className="max-w-sm opacity-80">{vi.closed.body}</p>
      <div>
        <div className="text-sm uppercase tracking-widest opacity-60">{vi.closed.countdown}</div>
        <div className="mt-1 text-2xl tabular-nums" data-testid="countdown">
          {formatCountdown(target - now)}
        </div>
      </div>
      {/* M5: nối tới OiiMate bot để đăng ký nhắc. */}
      <button
        type="button"
        disabled
        className="rounded-full bg-bus px-5 py-2 font-medium text-white opacity-60"
      >
        {vi.closed.remindMe}
      </button>
    </main>
  );
}
