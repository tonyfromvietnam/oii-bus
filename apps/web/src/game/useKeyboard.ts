import { GESTURES } from "@xom-oii/shared";
import { useEffect } from "react";
import { gesture, interact } from "./actions";
import { game } from "./state";
import { useUi } from "./ui";

/** Bàn phím desktop (brief §8). Bỏ qua khi đang gõ chat. */
export function useKeyboard() {
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const ui = useUi.getState();
      if (e.code === "Enter") {
        e.preventDefault();
        game.input.keys.clear();
        ui.setChatOpen(true);
        return;
      }
      if (e.code === "Escape") ui.setHelpOpen(false);
      if (e.code === "KeyE" && !e.repeat) interact();
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") game.input.run = true;
      const n = Number(e.key);
      if (!e.repeat && n >= 1 && n <= GESTURES.length) gesture(GESTURES[n - 1]!);
      if (e.code.startsWith("Arrow")) e.preventDefault();
      game.input.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      game.input.keys.delete(e.code);
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") game.input.run = false;
    };
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
