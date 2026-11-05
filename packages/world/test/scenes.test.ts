import { describe, expect, it } from "vitest";
import { AVATAR_RADIUS } from "@oii-bus/shared";
import { DUCKS, SCENES, circleIntersectsBox } from "../src";

const inside = (p: { x: number; z: number }, b: { minX: number; maxX: number; minZ: number; maxZ: number }) =>
  p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ;

describe.each(Object.values(SCENES))("scene $id", (scene) => {
  it("spawn không kẹt trong vật cản", () => {
    for (const c of scene.colliders) expect(circleIntersectsBox(scene.spawn, AVATAR_RADIUS, c)).toBe(false);
  });
  it("mọi spot nằm trong sàn", () => {
    for (const s of scene.spots) expect(inside(s, scene.bounds)).toBe(true);
  });
  it("mọi ghế đều có spot để bấm E", () => {
    for (const seat of scene.seats) expect(scene.spots.some((s) => s.seatId === seat.id)).toBe(true);
  });
  it("spot không phải ghế thì đi tới được (không nằm trong vật cản)", () => {
    for (const s of scene.spots.filter((s) => s.kind !== "seat")) {
      expect(scene.colliders.some((c) => circleIntersectsBox(s, 0.05, c))).toBe(false);
    }
  });
});

describe("thư viện", () => {
  it("là scene yên lặng, bus thì không", () => {
    expect(SCENES.library.quiet).toBe(true);
    expect(SCENES.bus.quiet).toBe(false);
  });
});

describe("vịt cao su", () => {
  it("5 con, đều nhặt được (trong sàn bus, không trong vật cản)", () => {
    expect(DUCKS).toHaveLength(5);
    for (const d of DUCKS) {
      expect(inside(d, SCENES.bus.bounds)).toBe(true);
      expect(SCENES.bus.colliders.some((c) => circleIntersectsBox(d, 0.2, c))).toBe(false);
    }
  });
});
