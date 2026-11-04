import type { DistanceBand } from "@xom-oii/shared";
import { create } from "zustand";

export interface LogEntry {
  id: number;
  who: string;
  text: string;
  band: DistanceBand | "system" | "self";
}

export interface UiState {
  prompt: string | null;
  toast: { id: number; text: string } | null;
  log: LogEntry[];
  chatOpen: boolean;
  helpOpen: boolean;
  wallet: number;
  clock: string;
  setPrompt: (p: string | null) => void;
  showToast: (text: string) => void;
  pushLog: (e: Omit<LogEntry, "id">) => void;
  setChatOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  spend: (amount: number) => boolean;
  setClock: (c: string) => void;
}

let seq = 0;

export const useUi = create<UiState>((set, get) => ({
  prompt: null,
  toast: null,
  log: [],
  chatOpen: false,
  helpOpen: false,
  wallet: 5,
  clock: "",
  setPrompt: (prompt) => {
    if (get().prompt !== prompt) set({ prompt });
  },
  showToast: (text) => set({ toast: { id: ++seq, text } }),
  pushLog: (e) => set((s) => ({ log: [...s.log, { ...e, id: ++seq }].slice(-30) })),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  spend: (amount) => {
    const w = get().wallet;
    if (w + 1e-9 < amount) return false;
    set({ wallet: Math.round((w - amount) * 100) / 100 });
    return true;
  },
  setClock: (clock) => {
    if (get().clock !== clock) set({ clock });
  },
}));

/** Truy cập store ngoài React (game loop). */
export const ui = () => useUi.getState();
