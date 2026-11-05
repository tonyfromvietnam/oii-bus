import { describe, expect, it } from "vitest";
import {
  BUS_SPEED,
  LANDMARKS,
  ROUTE_LENGTH,
  landmarkStatus,
  nearestLandmark,
  routeOffset,
  routeToLocalX,
} from "../src";

describe("tuyến Bus Oii vòng quanh UK", () => {
  it("offset tính từ giờ thật, quay vòng", () => {
    expect(routeOffset(0)).toBe(0);
    expect(routeOffset(1000)).toBeCloseTo(BUS_SPEED);
    expect(routeOffset((ROUTE_LENGTH / BUS_SPEED) * 1000)).toBeCloseTo(0);
  });
  it("địa danh trôi về phía sau (−x) theo thời gian", () => {
    const a = routeToLocalX(80, routeOffset(0));
    const b = routeToLocalX(80, routeOffset(2000));
    expect(b).toBeLessThan(a);
  });
  it("biết địa danh hiện tại và kế tiếp", () => {
    const s = landmarkStatus(0);
    expect(s.current?.id).toBe("big-ben");
    expect(s.next.id).toBe("london-eye");
    expect(s.metersToNext).toBeCloseTo(48);
  });
  it("vòng lại về Big Ben sau Giant's Causeway", () => {
    const s = landmarkStatus(ROUTE_LENGTH - 40);
    expect(s.next.id).toBe("big-ben");
    expect(s.metersToNext).toBeGreaterThan(0);
  });
  it("có các địa danh khắp UK", () => {
    const ids = LANDMARKS.map((l) => l.id);
    for (const id of [
      "big-ben",
      "london-eye",
      "stonehenge",
      "old-trafford",
      "bath",
      "birmingham",
      "edinburgh",
    ] as const) {
      expect(ids).toContain(id);
    }
  });
  it("chọn kiểu cảnh theo địa danh gần nhất", () => {
    const stone = LANDMARKS.find((l) => l.id === "stonehenge")!;
    expect(nearestLandmark(stone.at + 20).terrain).toBe("country");
    expect(nearestLandmark(LANDMARKS.find((l) => l.id === "brighton-pier")!.at).terrain).toBe("coast");
  });
});

describe("thành phố của địa danh", () => {
  it("mỗi địa danh gắn với một thành phố trong danh sách", async () => {
    const { CITIES } = await import("@xom-oii/shared");
    const ids = new Set(CITIES.map((c) => c.id));
    for (const lm of LANDMARKS) expect(ids.has(lm.city)).toBe(true);
  });
});
