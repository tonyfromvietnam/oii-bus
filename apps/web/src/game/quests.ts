import { vi, type QuestId } from "../copy/vi";
import { ui } from "./ui";

/** Mục tiêu của từng quest (bản thử offline; từ M5 do admin tạo và duyệt). */
export const QUEST_GOALS: Record<QuestId, number> = {
  ducks: 5,
  photos: 3,
  tea: 1,
  hotpot: 1,
  focus: 1,
  wave: 3,
};

export const QUEST_ORDER: QuestId[] = ["ducks", "photos", "tea", "hotpot", "focus", "wave"];

/** Cập nhật tiến độ; đủ mục tiêu thì trao tem (một lần). */
export function progressQuest(id: QuestId, value: number) {
  const u = ui();
  if (u.done[id]) return;
  const v = Math.min(value, QUEST_GOALS[id]);
  u.set({ progress: { ...u.progress, [id]: v } });
  if (v >= QUEST_GOALS[id]) {
    u.set({ done: { ...ui().done, [id]: true } });
    setTimeout(() => ui().showToast(vi.quests.stampEarned(vi.quests.items[id].stamp)), 300);
  }
}
