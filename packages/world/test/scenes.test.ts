import { describe, expect, it } from "vitest";
import { AVATAR_RADIUS, STATION_IDS } from "@oii-bus/shared";
import { BUS_SCENE, DECK_ZONES, SCENES, ZONE_IDS, circleIntersectsBox, zoneAt } from "../src";

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
      expect(scene.colliders.some((c) => circleIntersectsBox(s, AVATAR_RADIUS, c))).toBe(false);
    }
  });
});

describe("tầng thượng duy nhất", () => {
  it("chỉ còn một scene, rộng rãi", () => {
    expect(Object.keys(SCENES)).toEqual(["bus"]);
    const b = BUS_SCENE.bounds;
    expect(b.maxX - b.minX).toBeGreaterThanOrEqual(80);
    expect(b.maxZ - b.minZ).toBeGreaterThanOrEqual(20);
  });
  it("mỗi quầy làm việc có đúng một spot", () => {
    for (const id of STATION_IDS)
      expect(BUS_SCENE.spots.filter((s) => s.kind === "work" && s.station === id)).toHaveLength(1);
  });
  it("các khu nối liền nhau từ đuôi tới đầu xe", () => {
    expect(DECK_ZONES[ZONE_IDS[0]].minX).toBe(BUS_SCENE.bounds.minX);
    for (let i = 1; i < ZONE_IDS.length; i++)
      expect(DECK_ZONES[ZONE_IDS[i]!].minX).toBe(DECK_ZONES[ZONE_IDS[i - 1]!].maxX);
    expect(zoneAt(0)).toBe("plaza");
    expect(zoneAt(-40)).toBe("temple");
    expect(zoneAt(15)).toBe("viet");
  });
  it("mỗi quầy nằm trong khu của nó", () => {
    const want = { pho: "viet", tea: "tea", nails: "nails", essay: "deadline", mo: "temple" } as const;
    for (const s of BUS_SCENE.spots.filter((s) => s.kind === "work"))
      expect(zoneAt(s.x)).toBe(want[s.station!]);
  });
});
