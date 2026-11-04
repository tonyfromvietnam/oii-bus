import { describe, expect, it } from "vitest";
import {
  AcUkEmailSchema,
  AlumniCodeSchema,
  CLEAR_RADIUS,
  HEAR_RADIUS,
  InputMessageSchema,
  InviteCodeSchema,
  canUseVoice,
  containsUrl,
  distanceBand,
  sanitizeUserText,
  voiceGain,
} from "../src";

describe("proximity", () => {
  it("phân dải khoảng cách đúng mốc", () => {
    expect(distanceBand(0)).toBe("clear");
    expect(distanceBand(CLEAR_RADIUS)).toBe("clear");
    expect(distanceBand(CLEAR_RADIUS + 0.01)).toBe("far");
    expect(distanceBand(HEAR_RADIUS)).toBe("far");
    expect(distanceBand(HEAR_RADIUS + 0.01)).toBe("out");
  });
  it("voiceGain tuyến tính 1 → 0", () => {
    expect(voiceGain(1)).toBe(1);
    expect(voiceGain((CLEAR_RADIUS + HEAR_RADIUS) / 2)).toBeCloseTo(0.5);
    expect(voiceGain(HEAR_RADIUS)).toBe(0);
  });
});

describe("text", () => {
  it("bỏ ký tự điều khiển và zero-width", () => {
    const zwsp = String.fromCharCode(0x200b);
    const bell = String.fromCharCode(7);
    expect(sanitizeUserText(`  chào${zwsp}  bạn${bell}\n `)).toBe("chào bạn");
    expect(sanitizeUserText("a".repeat(300))).toHaveLength(120);
  });
  it("nhận ra link", () => {
    expect(containsUrl("vào https://x.y nhé")).toBe(true);
    expect(containsUrl("www.abc")).toBe(true);
    expect(containsUrl("ghé oiimate.app đi")).toBe(true);
    expect(containsUrl("meal deal £3.50 thôi")).toBe(false);
  });
});

describe("schemas", () => {
  it("mã mời và mã alumni", () => {
    expect(InviteCodeSchema.parse("oii-ab2c-xy9z")).toBe("OII-AB2C-XY9Z");
    expect(InviteCodeSchema.safeParse("OII-AB0C-XY9Z").success).toBe(false); // không có số 0
    expect(AlumniCodeSchema.parse("ALUM-TET26-K7MP")).toBe("ALUM-TET26-K7MP");
  });
  it("chỉ nhận email .ac.uk", () => {
    expect(AcUkEmailSchema.parse(" An@UCL.ac.uk ")).toBe("an@ucl.ac.uk");
    expect(AcUkEmailSchema.safeParse("an@gmail.com").success).toBe(false);
  });
  it("input từ chối NaN/Infinity", () => {
    expect(InputMessageSchema.safeParse({ seq: 1, x: NaN, z: 0, ry: 0 }).success).toBe(false);
    expect(InputMessageSchema.safeParse({ seq: 1, x: 1, z: 2, ry: 0 }).success).toBe(true);
  });
});

describe("voice eligibility", () => {
  const now = new Date("2026-11-07T20:00:00Z");
  const later = new Date("2026-11-20T00:00:00Z");
  it("probation chặn voice, trusted thì không", () => {
    expect(canUseVoice({ tier: "student", probationUntil: later, bannedAt: null }, now)).toBe(false);
    expect(canUseVoice({ tier: "trusted", probationUntil: later, bannedAt: null }, now)).toBe(true);
    expect(canUseVoice({ tier: "student", probationUntil: null, bannedAt: null }, now)).toBe(true);
  });
  it("bị ban thì không bao giờ có voice", () => {
    expect(canUseVoice({ tier: "trusted", probationUntil: null, bannedAt: now }, now)).toBe(false);
  });
});
