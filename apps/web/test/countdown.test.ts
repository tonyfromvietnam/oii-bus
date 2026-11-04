import { describe, expect, it } from "vitest";
import { formatCountdown } from "../src/lib/countdown";

describe("formatCountdown", () => {
  it("định dạng tiếng Việt", () => {
    expect(formatCountdown((2 * 86_400 + 3 * 3_600 + 4 * 60) * 1000)).toBe("2 ngày 3 giờ 4 phút");
    expect(formatCountdown((5 * 60 + 7) * 1000)).toBe("5 phút 7 giây");
    expect(formatCountdown(-1000)).toBe("0 phút 0 giây");
  });
});
