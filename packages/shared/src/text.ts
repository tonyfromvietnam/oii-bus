import { CHAT_MAX_LENGTH } from "./constants";

// Ký tự điều khiển C0/C1 (trừ khoảng trắng thường) và ký tự zero-width / bidi override.
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001F\u007F-\u009F]/g;
const hex = (n: number) => "\\u" + n.toString(16).padStart(4, "0");
const range = ([a, b]: readonly [number, number]) => `${hex(a)}-${hex(b)}`;
/** Zero-width, bidi override/isolate, BOM, soft hyphen. */
const INVISIBLE_RANGES = [
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2060, 0x2064],
  [0x2066, 0x2069],
  [0xfeff, 0xfeff],
  [0x00ad, 0x00ad],
] as const;
const INVISIBLE_RE = new RegExp(`[${INVISIBLE_RANGES.map(range).join("")}]`, "g");

/** Chuẩn hoá text người dùng: NFC, bỏ ký tự điều khiển/zero-width, gộp khoảng trắng, cắt độ dài. */
export function sanitizeUserText(input: string, maxLength = CHAT_MAX_LENGTH): string {
  return input
    .normalize("NFC")
    .replace(CONTROL_RE, " ")
    .replace(INVISIBLE_RE, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const URL_RE =
  /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|io|app|me|co|uk|vn|ly|gg|xyz|link|site|info|biz|tv)\b(\/\S*)?/i;

/** v1 chặn mọi link trong chat (brief §9). */
export function containsUrl(text: string): boolean {
  return URL_RE.test(text);
}
