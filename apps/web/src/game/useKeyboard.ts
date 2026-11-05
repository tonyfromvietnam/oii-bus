import { GESTURES } from "@oii-bus/shared";
import { useEffect } from "react";
import { gesture, interact } from "./actions";
import { setAfk, tapStation, useFarm } from "./farm";
import { useProgress } from "./progress";
import { game } from "./state";
import { useUi } from "./ui";

/** Bàn phím desktop. Bỏ qua khi đang gõ hoặc khi đang mở bảng. */
export function useKeyboard() {
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const ui = useUi.getState();
      const prog = useProgress.getState();
      const farm = useFarm.getState();
      if (e.code === "Escape") {
        ui.set({
          helpOpen: false,
          donateOpen: false,
          duyen: { ...ui.duyen, open: false },
          city: { ...ui.city, open: false },
        });
        prog.set({ open: false });
        if (farm.afk) void setAfk(false);
        farm.set({ open: null, away: null });
        return;
      }
      if (farm.afk) {
        if (e.code === "KeyZ" || e.code === "Space") void setAfk(false);
        return;
      }
      const panelOpen =
        ui.creatorOpen || ui.helpOpen || ui.donateOpen || ui.duyen.open || ui.city.open || prog.open;
      if (panelOpen) return;
      // đang mở quầy: Space (hoặc giữ Space) để làm việc
      if (farm.open && e.code === "Space") {
        e.preventDefault();
        tapStation(farm.open);
        return;
      }
      if (e.code === "Enter") {
        e.preventDefault();
        game.input.keys.clear();
        ui.set({ chatOpen: true });
        return;
      }
      if (e.code === "KeyE" && !e.repeat) interact();
      if (e.code === "KeyZ" && !e.repeat) void setAfk(true);
      if (e.code === "KeyC" && !e.repeat) ui.set({ city: { ...ui.city, open: true } });
      if (e.code === "KeyP" && !e.repeat) prog.set({ open: true });
      const n = Number(e.key);
      if (!e.repeat && n >= 1 && n <= GESTURES.length) gesture(GESTURES[n - 1]!);
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
      game.input.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => game.input.keys.delete(e.code);
    const blur = () => game.input.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
