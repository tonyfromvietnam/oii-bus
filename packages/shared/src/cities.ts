/** Các thành phố có nhiều du học sinh Việt (dùng cho "Cùng thành phố" và gợi ý theo tuyến bus). */
export const CITIES = [
  { id: "london", name: "London" },
  { id: "manchester", name: "Manchester" },
  { id: "birmingham", name: "Birmingham" },
  { id: "liverpool", name: "Liverpool" },
  { id: "leeds", name: "Leeds" },
  { id: "sheffield", name: "Sheffield" },
  { id: "newcastle", name: "Newcastle" },
  { id: "nottingham", name: "Nottingham" },
  { id: "leicester", name: "Leicester" },
  { id: "coventry", name: "Coventry" },
  { id: "bristol", name: "Bristol" },
  { id: "bath", name: "Bath" },
  { id: "oxford", name: "Oxford" },
  { id: "cambridge", name: "Cambridge" },
  { id: "brighton", name: "Brighton" },
  { id: "southampton", name: "Southampton" },
  { id: "canterbury", name: "Canterbury" },
  { id: "york", name: "York" },
  { id: "lancaster", name: "Lancaster" },
  { id: "durham", name: "Durham" },
  { id: "exeter", name: "Exeter" },
  { id: "cardiff", name: "Cardiff" },
  { id: "bangor", name: "Bangor" },
  { id: "edinburgh", name: "Edinburgh" },
  { id: "glasgow", name: "Glasgow" },
  { id: "aberdeen", name: "Aberdeen" },
  { id: "belfast", name: "Belfast" },
] as const;

export type CityId = (typeof CITIES)[number]["id"];
export const CITY_IDS = CITIES.map((c) => c.id) as [CityId, ...CityId[]];

export function cityName(id: CityId): string {
  return CITIES.find((c) => c.id === id)?.name ?? id;
}
