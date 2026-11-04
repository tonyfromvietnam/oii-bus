import { z } from "zod";
import { CHAT_MAX_LENGTH, NICKNAME_MAX_LENGTH } from "./constants";
import { TIERS } from "./tiers";

/** Mọi payload client → server phải đi qua các schema này (brief §15). */

export const TierSchema = z.enum(TIERS);

export const HATS = ["none", "non-la", "beanie", "grad-cap", "cat-ears", "headphones"] as const;
export type Hat = (typeof HATS)[number];
export const HatSchema = z.enum(HATS);

export const CoatColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Màu áo phải dạng #RRGGBB");

export const NicknameSchema = z
  .string()
  .trim()
  .min(1, "Biệt danh không được trống")
  .max(NICKNAME_MAX_LENGTH, `Tối đa ${NICKNAME_MAX_LENGTH} ký tự`);

export const AvatarSchema = z.object({
  nickname: NicknameSchema,
  coatColor: CoatColorSchema,
  hat: HatSchema,
});

// --- Mã ---
const CODE_ALPHABET = "[A-HJ-NP-Z2-9]"; // bỏ I, O, 0, 1 cho dễ đọc
export const INVITE_CODE_RE = new RegExp(`^OII-${CODE_ALPHABET}{4}-${CODE_ALPHABET}{4}$`);
export const ALUMNI_CODE_RE = new RegExp(`^ALUM-[A-Z0-9]{2,16}-${CODE_ALPHABET}{4}$`);
export const InviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(INVITE_CODE_RE, "Mã mời dạng OII-XXXX-XXXX");
export const AlumniCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(ALUMNI_CODE_RE, "Mã alumni dạng ALUM-<CAMPAIGN>-XXXX");

// --- Auth ---
export const AcUkEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email không hợp lệ")
  .refine((e) => e.endsWith(".ac.uk"), "Cần email trường .ac.uk");

export const OtpCodeSchema = z.string().regex(/^\d{6}$/, "Mã gồm 6 chữ số");

export const MagicLinkRequestSchema = z.object({
  psidHash: z.string().min(16).max(128),
  tier: TierSchema,
});

// --- Realtime (client → server) ---
const finite = z.number().finite();

export const InputMessageSchema = z.object({
  seq: z.number().int().nonnegative(),
  x: finite,
  z: finite,
  /** Góc quay quanh trục y (radian). */
  ry: finite,
});

export const GESTURES = ["wave", "tea", "hug", "sorry", "cheers"] as const;
export const GestureSchema = z.enum(GESTURES);
export const GestureMessageSchema = z.object({ gesture: GestureSchema });

export const ChatMessageSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(CHAT_MAX_LENGTH * 2), // cắt thật sau khi sanitize
});

export const TypingMessageSchema = z.object({ typing: z.boolean() });

export const InteractMessageSchema = z.object({ spotId: z.string().min(1).max(64) });

export const REPORT_REASONS = ["harassment", "hate", "sexual", "spam", "underage", "other"] as const;
export const ReportSchema = z.object({
  targetId: z.string().min(1),
  context: z.enum(["chat", "voice", "behaviour"]),
  reason: z.enum(REPORT_REASONS),
  includeLastMessage: z.boolean().default(false),
  note: z.string().max(500).optional(),
});

export type InputMessage = z.infer<typeof InputMessageSchema>;
export type Gesture = z.infer<typeof GestureSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
export type Avatar = z.infer<typeof AvatarSchema>;
