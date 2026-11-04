import { describe, expect, it } from "vitest";
import { BUS_SPEED, LANDMARKS, ROUTE_LENGTH, landmarkStatus, routeOffset, routeToLocalX } from "../src";

describe("tuyến bus vòng London", () => {
  it("offset tính từ giờ thật, quay vòng", () => {
    expect(routeOffset(0)).toBe(0);
    expect(routeOffset(1000)).toBeCloseTo(BUS_SPEED);
    expect(routeOffset((ROUTE_LENGTH / BUS_SPEED) * 1000)).toBeCloseTo(0);
  });
  it("địa danh trôi về phía sau (−x) theo thời gian", () => {
    const a = routeToLocalX(90, routeOffset(0));
    const b = routeToLocalX(90, routeOffset(2000));
    expect(b).toBeLessThan(a);
  });
  it("biết địa danh hiện tại và kế tiếp", () => {
    const s = landmarkStatus(0);
    expect(s.current?.id).toBe("big-ben");
    expect(s.next.id).toBe("london-eye");
    expect(s.metersToNext).toBeCloseTo(50);
  });
  it("vòng lại về Big Ben sau Chinatown", () => {
    const s = landmarkStatus(670);
    expect(s.next.id).toBe("big-ben");
    expect(s.metersToNext).toBeGreaterThan(0);
  });
  it("8 địa danh cách đều trên tuyến", () => {
    expect(LANDMARKS).toHaveLength(8);
    for (const lm of LANDMARKS) expect(lm.at).toBeLessThan(ROUTE_LENGTH);
  });
});
