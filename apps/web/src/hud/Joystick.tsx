import { useRef, useState } from "react";
import { game } from "../game/state";

const R = 56;

/** Joystick ảo bên trái (mobile). Ghi thẳng vào game.input.joy. */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const update = (cx: number, cy: number) => {
    const r = base.current?.getBoundingClientRect();
    if (!r) return;
    let dx = cx - (r.left + r.width / 2);
    let dy = cy - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    setKnob({ x: dx, y: dy });
    game.input.joy.x = dx / R;
    game.input.joy.y = -dy / R;
  };
  const reset = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    game.input.joy.x = 0;
    game.input.joy.y = 0;
  };

  return (
    <div
      ref={base}
      data-testid="joystick"
      className="pointer-events-auto absolute bottom-24 left-6 h-32 w-32 touch-none rounded-full border border-white/25 bg-white/10 backdrop-blur-sm"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-white/60 shadow"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
