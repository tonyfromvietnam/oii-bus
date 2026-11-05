import { PlanCreateSchema, cityName, type CityId, type PlanCreate } from "@xom-oii/shared";
import { viCity } from "../copy/vi";
import { progressQuest } from "./quests";
import { ui } from "./ui";

/**
 * "Cùng thành phố" — bản thử offline. Người và kế hoạch "ví dụ" là dữ liệu mẫu.
 * Từ M3: lưu ở Postgres (Plan, PlanMember, CityVisit), chỉ tài khoản đã xác minh mới thấy.
 */
export interface CityPerson {
  id: string;
  name: string;
  color: string;
  city: CityId;
  /** Nếu là người sắp tới (không sống ở đó). */
  visiting?: string;
}

export interface Plan extends PlanCreate {
  id: string;
  by: string;
  members: string[];
  example: boolean;
}

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const nextSat = () => (6 - new Date().getDay() + 7) % 7 || 7;

export const CITY_PEOPLE: CityPerson[] = [
  { id: "banh-mi", name: "Bánh Mì", color: "#fde3a0", city: "manchester" },
  { id: "tra-sua", name: "Trà Sữa", color: "#d6ccf2", city: "london" },
  { id: "cun", name: "Cún", color: "#a8d3d9", city: "london" },
  { id: "su-su", name: "Su Su", color: "#c5e3d3", city: "birmingham" },
  { id: "mit", name: "Mít", color: "#ffd2b5", city: "edinburgh" },
  { id: "p-1", name: "Bắp Rang", color: "#f6c6cf", city: "manchester", visiting: day(nextSat()) },
  { id: "p-2", name: "Kem Dừa", color: "#a8d3d9", city: "london" },
  { id: "p-3", name: "Sữa Chua", color: "#fde3a0", city: "leeds" },
  { id: "p-4", name: "Xoài Non", color: "#c5e3d3", city: "edinburgh", visiting: day(nextSat() + 1) },
  { id: "p-5", name: "Nem Rán", color: "#ffd2b5", city: "bristol" },
];

export const SAMPLE_PLANS: Plan[] = [
  {
    id: "pl-1",
    title: "Ăn phở ở Chinatown rồi đi dạo",
    city: "manchester",
    date: day(nextSat()),
    time: "18:30",
    maxPeople: 6,
    note: "Gặp ở cổng Chinatown.",
    by: "Bánh Mì",
    members: ["banh-mi", "p-1"],
    example: true,
  },
  {
    id: "pl-2",
    title: "Picnic Hyde Park nếu trời nắng",
    city: "london",
    date: day(nextSat() + 1),
    time: "13:00",
    maxPeople: 8,
    note: "Mỗi người mang một món.",
    by: "Trà Sữa",
    members: ["tra-sua", "cun", "p-2"],
    example: true,
  },
  {
    id: "pl-3",
    title: "Leo Arthur's Seat ngắm hoàng hôn",
    city: "edinburgh",
    date: day(nextSat()),
    time: "15:00",
    maxPeople: 5,
    note: "Mang giày leo núi và áo ấm.",
    by: "Mít",
    members: ["mit"],
    example: true,
  },
  {
    id: "pl-4",
    title: "Học nhóm ở thư viện trước kỳ thi",
    city: "birmingham",
    date: day(3),
    time: "10:00",
    maxPeople: 4,
    note: "",
    by: "Su Su",
    members: ["su-su"],
    example: true,
  },
];

export function peopleIn(city: CityId): CityPerson[] {
  return CITY_PEOPLE.filter((p) => p.city === city);
}

export function plansIn(city: CityId): Plan[] {
  return ui().city.plans.filter((p) => p.city === city);
}

export function createPlan(input: unknown): boolean {
  const parsed = PlanCreateSchema.safeParse(input);
  if (!parsed.success) {
    ui().showToast(viCity.invalid);
    return false;
  }
  const c = ui().city;
  const plan: Plan = {
    ...parsed.data,
    id: `my-${Date.now()}`,
    by: ui().me.nickname,
    members: ["me"],
    example: false,
  };
  ui().set({ city: { ...c, plans: [plan, ...c.plans], tab: "plans" } });
  ui().showToast(viCity.created);
  progressQuest("plan", 1);
  return true;
}

export function toggleJoin(id: string) {
  const c = ui().city;
  const plans = c.plans.map((p) => {
    if (p.id !== id) return p;
    const inIt = p.members.includes("me");
    if (!inIt && p.members.length >= p.maxPeople) return p;
    if (!inIt) {
      ui().showToast(viCity.joined);
      progressQuest("plan", 1);
    }
    return { ...p, members: inIt ? p.members.filter((m) => m !== "me") : [...p.members, "me"] };
  });
  ui().set({ city: { ...c, plans } });
}

export const cityLabel = cityName;
