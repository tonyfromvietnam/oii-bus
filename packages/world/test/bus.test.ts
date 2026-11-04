import { describe, expect, it } from "vitest";
import { BUS, BusSim } from "../src/bus";

const run = (bus: BusSim, seconds: number, dt = 1 / 20) => {
  for (let t = 0; t < seconds; t += dt) bus.step(dt);
};

describe("bus N29", () => {
  it("chạy hướng −x và dừng đúng bến", () => {
    const bus = new BusSim();
    const x0 = bus.x;
    bus.step(0.5);
    expect(bus.x).toBeLessThan(x0);
    let t = 0;
    while (bus.phase === "arriving" && t < 60) {
      bus.step(1 / 20);
      t += 1 / 20;
    }
    expect(t).toBeLessThan(20);
    expect(bus.phase).toBe("stopped");
    expect(bus.x).toBe(BUS.stopX);
    expect(bus.doorsOpen).toBe(true);
    expect(bus.stopCount).toBe(1);
  });

  it("dừng khoảng 14 giây rồi đi tiếp", () => {
    const bus = new BusSim(29, { x: BUS.stopX, phase: "stopped", timer: BUS.stopSeconds, speed: 0 });
    run(bus, 13.5);
    expect(bus.phase).toBe("stopped");
    run(bus, 1);
    expect(bus.phase).toBe("departing");
  });

  it("vòng lại sau 10–18 giây", () => {
    const bus = new BusSim(29, { x: BUS.endX + 0.1, phase: "departing", speed: BUS.cruise });
    bus.step(0.1);
    expect(bus.phase).toBe("away");
    expect(bus.timer).toBeGreaterThanOrEqual(BUS.gapMin);
    expect(bus.timer).toBeLessThanOrEqual(BUS.gapMax);
    run(bus, BUS.gapMax + 0.5);
    expect(bus.phase).toBe("arriving");
  });

  it("tất định theo seed", () => {
    const a = new BusSim(7);
    const b = new BusSim(7);
    run(a, 120);
    run(b, 120);
    expect(a.x).toBe(b.x);
    expect(a.phase).toBe(b.phase);
  });
});
