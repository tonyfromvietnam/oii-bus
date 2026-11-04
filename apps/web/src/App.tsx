import { useEffect, useState } from "react";
import { vi } from "./copy/vi";
import { fetchStatus, type StreetStatus } from "./lib/api";
import { ClosedScreen } from "./screens/ClosedScreen";
import { OpenScreen } from "./screens/OpenScreen";

type State = { kind: "loading" } | { kind: "error" } | { kind: "ready"; status: StreetStatus };

export function App() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchStatus(ctrl.signal)
      .then((status) => setState({ kind: "ready", status }))
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
  return state.status.open ? (
    <OpenScreen closesAt={state.status.closesAt} />
  ) : (
    <ClosedScreen nextOpeningAt={state.status.nextOpeningAt} />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="flex h-full items-center justify-center px-6 opacity-80">{children}</main>;
}
