import type { Hat, StationId } from "@oii-bus/shared";
import { SCENES, STATION_SPOTS, seatById, type SceneId } from "@oii-bus/world";
import { viFarm } from "../copy/farm";
import type { AvatarAnim } from "./state";

/**
 * Bạn đồng hành dạng bot cho bản thử offline (để xe không vắng). Từ M2 là người thật qua Colyseus.
 */
export type NpcMode = "wander" | "sit" | "sleep" | "sing" | "work";

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
  station?: StationId;
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

/** Bot đứng làm ở quầy, cạnh chỗ người chơi đứng (để xe lúc nào cũng có người đang "cày"). */
function working(station: StationId, side: -1 | 1) {
  const sp = STATION_SPOTS[station];
  return { x: sp.x + side * 1.5, z: sp.z, ry: Math.PI, station };
}

export const NPCS: Npc[] = [
  npc({
    id: "banh-mi",
    name: "Bánh Mì",
    scene: "bus",
    color: "#fde3a0",
    hat: "cat-ears",
    mode: "wander",
    x: -2,
    z: 2,
    lines: LINES.banhMi,
  }),
  npc({
    id: "tra-sua",
    name: "Trà Sữa",
    scene: "bus",
    color: "#d6ccf2",
    hat: "none",
    mode: "wander",
    x: 26,
    z: 1,
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
    x: 36,
    z: 7.2,
    lines: LINES.suSu,
  }),
  npc({
    id: "mit",
    name: "Mít",
    scene: "bus",
    color: "#ffd2b5",
    hat: "non-la",
    mode: "sleep",
    ...seated("bus", "table-0-0"),
    pose: "sleep",
    lines: LINES.mit,
  }),
  npc({
    id: "na",
    name: "Na",
    scene: "bus",
    color: "#f6c6cf",
    hat: "beanie",
    mode: "work",
    ...working("pho", 1),
    lines: viFarm.stations.pho.lines,
  }),
  npc({
    id: "khoai",
    name: "Khoai",
    scene: "bus",
    color: "#a8d3d9",
    hat: "headphones",
    mode: "work",
    ...working("nails", -1),
    lines: viFarm.stations.nails.lines,
  }),
  npc({
    id: "bo",
    name: "Bơ",
    scene: "bus",
    color: "#c5e3d3",
    hat: "grad-cap",
    mode: "work",
    ...working("essay", 1),
    lines: viFarm.stations.essay.lines,
  }),
  npc({
    id: "gao",
    name: "Gạo",
    scene: "bus",
    color: "#fde3a0",
    hat: "none",
    mode: "work",
    ...working("mo", -1),
    lines: viFarm.stations.mo.lines,
  }),
  npc({
    id: "sen",
    name: "Sen",
    scene: "bus",
    color: "#f6c6cf",
    hat: "non-la",
    mode: "sit",
    ...seated("bus", "cushion-2"),
    pose: "sit",
    lines: ["📿 Nam mô…", "🙏"],
  }),
  npc({
    id: "dau",
    name: "Đậu",
    scene: "bus",
    color: "#d6ccf2",
    hat: "cat-ears",
    mode: "wander",
    x: -14,
    z: 3,
    lines: LINES.traSua,
  }),
];

export function randomWalkable(scene: SceneId): { x: number; z: number } {
  const b = SCENES[scene].bounds;
  return {
    x: b.minX + 1 + Math.random() * (b.maxX - b.minX - 2),
    z: b.minZ + 0.8 + Math.random() * (b.maxZ - b.minZ - 1.6),
  };
}
