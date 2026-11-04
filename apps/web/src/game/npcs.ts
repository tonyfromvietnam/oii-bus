import type { Hat } from "@xom-oii/shared";
import { SCENES, seatById, type SceneId } from "@xom-oii/world";
import type { AvatarAnim } from "./state";

/**
 * Bạn đồng hành dạng bot cho bản thử offline (để xe không vắng). Từ M2 là người thật qua Colyseus.
 */
export type NpcMode = "wander" | "sit" | "sleep" | "study" | "sing";

export interface Npc extends AvatarAnim {
  id: string;
  name: string;
  scene: SceneId;
  color: string;
  hat: Hat;
  mode: NpcMode;
  target: { x: number; z: number } | null;
  timer: number;
  nextLineAt: number;
  lines: readonly string[];
}

const LINES = {
  banhMi: [
    "Deadline 23:59 mà giờ mới mở đề bài 🙃",
    "Ai đi Lidl chiều nay không, chia tiền taxi…",
    "Hôm nay trời nắng! Nắng thật đấy! Chụp ảnh đi!",
  ],
  traSua: [
    "Trà sữa ở đây ngon phết, gần bằng ở nhà 🧋",
    "Mẹ vừa gửi lạp xưởng sang, tối nay ăn lẩu nhé!",
    "Meal deal lại tăng giá rồi, buồn ghê 🥲",
  ],
  cun: [
    "Lẩu chín rồi, ngồi xuống đi bạn ơi 🍲",
    "Lò sưởi nhà mình hỏng, landlord bảo “next week” 3 tuần rồi.",
    "Cheers mate! …à quên, mình người Việt 😂",
  ],
  suSu: ["🎤 Cả xe ơi, hát cùng nào!", "🎤 Ai song ca với mình không?"],
  mit: ["Zzz… nộp rồi… nộp rồi mà…", "Zzz… cho em gia hạn thêm 1 ngày…"],
  study: ["📖", "✍️", "🤓"],
} as const;

const npc = (
  p: Partial<Npc> & Pick<Npc, "id" | "name" | "scene" | "color" | "hat" | "mode" | "x" | "z">,
): Npc => ({
  ry: 0,
  speed: 0,
  pose: "stand",
  holding: null,
  gesture: null,
  bubble: null,
  target: null,
  timer: Math.random() * 3,
  nextLineAt: 5 + Math.random() * 10,
  lines: [],
  ...p,
});

function seated(scene: SceneId, seatId: string) {
  const s = seatById(scene, seatId)!;
  return { x: s.x, z: s.z, ry: s.ry };
}

export const NPCS: Npc[] = [
  npc({
    id: "banh-mi",
    name: "Bánh Mì",
    scene: "bus",
    color: "#fde3a0",
    hat: "cat-ears",
    mode: "wander",
    x: 0,
    z: -1,
    lines: LINES.banhMi,
  }),
  npc({
    id: "tra-sua",
    name: "Trà Sữa",
    scene: "bus",
    color: "#d6ccf2",
    hat: "none",
    mode: "wander",
    x: 8,
    z: -1.2,
    holding: "tea",
    lines: LINES.traSua,
  }),
  npc({
    id: "cun",
    name: "Cún",
    scene: "bus",
    color: "#a8d3d9",
    hat: "beanie",
    mode: "sit",
    ...seated("bus", "hotpot-1"),
    pose: "sit",
    lines: LINES.cun,
  }),
  npc({
    id: "su-su",
    name: "Su Su",
    scene: "bus",
    color: "#c5e3d3",
    hat: "headphones",
    mode: "sing",
    x: 6.5,
    z: 1.6,
    ry: 0,
    lines: LINES.suSu,
  }),
  npc({
    id: "mit",
    name: "Mít",
    scene: "bus",
    color: "#ffd2b5",
    hat: "non-la",
    mode: "sleep",
    ...seated("bus", "front-0-0"),
    pose: "sleep",
    lines: LINES.mit,
  }),
  npc({
    id: "bo",
    name: "Bơ",
    scene: "library",
    color: "#c5e3d3",
    hat: "grad-cap",
    mode: "study",
    ...seated("library", "desk-0-1"),
    pose: "sit",
    lines: LINES.study,
  }),
  npc({
    id: "khoai",
    name: "Khoai",
    scene: "library",
    color: "#a8d3d9",
    hat: "headphones",
    mode: "study",
    ...seated("library", "desk-3-0"),
    pose: "sit",
    lines: LINES.study,
  }),
  npc({
    id: "na",
    name: "Na",
    scene: "library",
    color: "#f6c6cf",
    hat: "beanie",
    mode: "sleep",
    ...seated("library", "armchair-1"),
    pose: "sleep",
    lines: ["Zzz…"],
  }),
];

export function randomWalkable(scene: SceneId): { x: number; z: number } {
  const b = SCENES[scene].bounds;
  return {
    x: b.minX + 1 + Math.random() * (b.maxX - b.minX - 2),
    z: b.minZ + 0.8 + Math.random() * (b.maxZ - b.minZ - 1.6),
  };
}
