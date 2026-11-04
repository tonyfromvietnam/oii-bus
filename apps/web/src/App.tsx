import { Suspense, lazy, useEffect, useState } from "react";
import { vi } from "./copy/vi";
import { fetchStatus, type StreetStatus } from "./lib/api";
import { ClosedScreen } from "./screens/ClosedScreen";

const World = lazy(() => import("./World"));

type State =
  { kind: "loading" } | { kind: "error" } | { kind: "ready"; status: StreetStatus } | { kind: "world" };

const params = new URLSearchParams(location.search);
/** Bản prototype tĩnh (artifact / staging không có server) hoặc ?preview → vào thẳng phố offline. */
const STANDALONE = import.meta.env.VITE_STANDALONE === "true" || params.has("preview");

export function App() {
  const [state, setState] = useState<State>(STANDALONE ? { kind: "world" } : { kind: "loading" });

  useEffect(() => {
    if (STANDALONE) return;
    const ctrl = new AbortController();
    fetchStatus(ctrl.signal)
      .then((status) => setState(status.open ? { kind: "world" } : { kind: "ready", status }))
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) {
          console.error(err);
          setState({ kind: "error" });
        }
      });
    return () => ctrl.abort();
  }, []);

  if (state.kind === "loading") return <Centered>{vi.loading}</Centered>;
  if (state.kind === "error") return <Centered>{vi.serverDown}</Centered>;
  if (state.kind === "ready")
    return (
      <ClosedScreen
        nextOpeningAt={state.status.nextOpeningAt}
        onPreview={() => setState({ kind: "world" })}
      />
    );
  return (
    <Suspense fallback={<Centered>{vi.loadingWorld}</Centered>}>
      <World />
    </Suspense>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="flex h-full items-center justify-center px-6 opacity-80">{children}</main>;
}
