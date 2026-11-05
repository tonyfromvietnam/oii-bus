import type { CityId, DistanceBand, Gender, Hat, Seeking } from "@xom-oii/shared";
import type { SceneId } from "@xom-oii/world";
import { create } from "zustand";
import type { QuestId } from "../copy/vi";
import { SAMPLE_PLANS, type Plan } from "./city";
import type { DmMessage } from "./match";

export interface LogEntry {
  id: number;
  who: string;
  text: string;
  band: DistanceBand | "system" | "self";
}

export interface Me {
  nickname: string;
  color: string;
  hat: Hat;
}

export interface DuyenState {
  open: boolean;
  step: "intro" | "searching" | "chat" | "ended";
  gender: Gender | null;
  seeking: Seeking;
  partner: { name: string; city: CityId } | null;
  messages: DmMessage[];
  endsAt: number;
  typing: boolean;
}

export interface CityState {
  open: boolean;
  tab: "people" | "plans";
  home: CityId | null;
  visiting: { city: CityId; from: string; to: string }[];
  view: CityId | null;
  plans: Plan[];
  waved: string[];
}

export interface UiState {
  scene: SceneId;
  me: Me;
  prompt: string | null;
  toast: { id: number; text: string } | null;
  log: LogEntry[];
  chatOpen: boolean;
  helpOpen: boolean;
  questsOpen: boolean;
  creatorOpen: boolean;
  wallet: number;
  where: { now: string | null; next: string; meters: number; joke: string | null };
  done: Partial<Record<QuestId, true>>;
  progress: Partial<Record<QuestId, number>>;
  music: { on: boolean; volume: number };
  seatedAtDesk: boolean;
  focus: { running: boolean; seconds: number };
  fade: boolean;
  merit: number;
  donateOpen: boolean;
  duyen: DuyenState;
  city: CityState;
  setPrompt: (p: string | null) => void;
  showToast: (text: string) => void;
  pushLog: (e: Omit<LogEntry, "id">) => void;
  set: (patch: Partial<UiState>) => void;
  spend: (amount: number) => boolean;
}

let seq = 0;

export const useUi = create<UiState>((set, get) => ({
  scene: "bus",
  me: { nickname: "Bánh Bao", color: "#a8d3d9", hat: "beanie" },
  prompt: null,
  toast: null,
  log: [],
  chatOpen: false,
  helpOpen: false,
  questsOpen: false,
  creatorOpen: true,
  wallet: 30,
  where: { now: null, next: "", meters: 0, joke: null },
  done: {},
  progress: {},
  music: { on: false, volume: 0.6 },
  seatedAtDesk: false,
  focus: { running: false, seconds: 0 },
  fade: false,
  merit: 0,
  donateOpen: false,
  duyen: {
    open: false,
    step: "intro",
    gender: null,
    seeking: "opposite",
    partner: null,
    messages: [],
    endsAt: 0,
    typing: false,
  },
  city: { open: false, tab: "plans", home: null, visiting: [], view: null, plans: SAMPLE_PLANS, waved: [] },
  setPrompt: (prompt) => {
    if (get().prompt !== prompt) set({ prompt });
  },
  showToast: (text) => set({ toast: { id: ++seq, text } }),
  pushLog: (e) => set((s) => ({ log: [...s.log, { ...e, id: ++seq }].slice(-30) })),
  set: (patch) => set(patch),
  spend: (amount) => {
    const w = get().wallet;
    if (w + 1e-9 < amount) return false;
    set({ wallet: Math.round((w - amount) * 100) / 100 });
    return true;
  },
}));

/** Truy cập store ngoài React (game loop). */
export const ui = () => useUi.getState();
