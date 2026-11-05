/** Mọi hằng số dùng chung client + server. Đơn vị: mét, giây, mili-giây. */

// --- Khoảng cách (chat + voice), brief §9–10 ---
/** Trong bán kính này đọc/nghe rõ. */
export const CLEAR_RADIUS = 4.5;
/** Từ CLEAR_RADIUS tới đây là "nghe loáng thoáng". Ngoài đây chỉ nhận "· · ·". */
export const HEAR_RADIUS = 9;

// --- Chat chữ ---
export const CHAT_MAX_LENGTH = 120;
export const CHAT_MIN_INTERVAL_MS = 1_000;
export const CHAT_MAX_PER_MINUTE = 20;

// --- Di chuyển ---
/** Server từ chối tốc độ lớn hơn (m/s). Cho phép sai số mạng nhỏ khi validate. */
export const MAX_SPEED = 5;
export const MAX_SPEED_TOLERANCE = 1.2;
export const AVATAR_RADIUS = 0.35;

// --- Mạng ---
export const SNAPSHOT_HZ = 10;
export const INPUT_HZ = 15;
export const VOICE_SUBSCRIPTION_HZ = 2;

// --- Instance ---
export const INSTANCE_CAPACITY = 40;

// --- Tài khoản ---
export const NICKNAME_MAX_LENGTH = 16;
export const PROBATION_DAYS = 14;
export const TRUSTED_MIN_ACTIVE_WEEKENDS = 3;
export const INVITE_CODES_PER_STUDENT = 2;
export const ALUMNI_CODE_TTL_DAYS = 7;

// --- Auth ---
export const MAGIC_LINK_TTL_MS = 5 * 60_000;
export const OTP_TTL_MS = 10 * 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const SESSION_TTL_MS = 14 * 24 * 60 * 60_000;
export const SESSION_COOKIE = "oiibus_sid";

// --- Dữ liệu ---
export const CHAT_LOG_RETENTION_DAYS = 14;

// --- Giờ mở cửa (Europe/London), brief §11 ---
export const LONDON_TZ = "Europe/London";
