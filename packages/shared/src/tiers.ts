/**
 * Hạng = nguồn gốc tài khoản. "Đã tin cậy" là cờ riêng (`trustedAt`), không phải hạng,
 * để alumni lên trusted vẫn giữ ★ (quyết định ARCHITECTURE §9.2).
 */
export const TIERS = ["student", "alumni", "professional"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABEL_VI: Record<Tier, string> = {
  student: "Sinh viên",
  alumni: "Cựu sinh viên",
  professional: "Người đi làm",
};
export const TRUSTED_LABEL_VI = "Đã tin cậy";

export interface VoiceEligibilityInput {
  trustedAt: Date | null;
  probationUntil: Date | null;
  bannedAt: Date | null;
}

/**
 * Brief §10: token voice chỉ cấp khi chưa bị ban VÀ (trusted HOẶC đã hết probation).
 * Server là nơi duy nhất ra quyết định; client chỉ dùng để hiển thị giải thích.
 */
export function canUseVoice(u: VoiceEligibilityInput, now: Date = new Date()): boolean {
  if (u.bannedAt) return false;
  if (u.trustedAt) return true;
  return u.probationUntil === null || u.probationUntil.getTime() <= now.getTime();
}
