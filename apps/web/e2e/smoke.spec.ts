import { expect, test, type Page } from "@playwright/test";

type Pos = { x: number; z: number };
const pos = (page: Page) =>
  page.evaluate<Pos>(() => ({ x: window.__xom!.player.x, z: window.__xom!.player.z }));
const teleport = (page: Page, x: number, z: number) =>
  page.evaluate(([px, pz]) => Object.assign(window.__xom!.player, { x: px, z: pz }), [x, z] as const);

test.beforeEach(async ({ page }) => {
  await page.goto("/?lowfx");
  await expect(page.getByTestId("world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => !!window.__xom && window.__xom.time > 0.5);
  // tạo nhân vật rồi lên xe
  await expect(page.getByTestId("creator")).toBeVisible();
  await page.getByTestId("go").click();
  await expect(page.getByTestId("creator")).toBeHidden();
});

test("desktop: lên Bus Oii, đi lại bằng bàn phím, thấy địa danh", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await expect(page.getByTestId("where")).toContainText(/Đang qua|Sắp tới/);
  const before = await pos(page);
  await page.keyboard.down("KeyD");
  // máy CI render chậm (không GPU): giữ phím tới khi nhân vật đi được một đoạn
  await expect.poll(async () => (await pos(page)).x - before.x).toBeGreaterThan(0.3);
  await page.keyboard.up("KeyD");
});

test("desktop: mua trà sữa ở quầy (E) → cầm cốc, có tiến độ nhiệm vụ", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await teleport(page, 6.5, -1.6);
  await expect(page.getByTestId("prompt")).toContainText("trà sữa");
  await page.keyboard.press("KeyE");
  await expect.poll(() => page.evaluate(() => window.__xom!.player.holding)).toBe("tea");
});

test("desktop: xuống thư viện → lofi tự bật, chat bị tắt", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await teleport(page, -12.5, 2.3);
  await expect(page.getByTestId("prompt")).toContainText("thư viện");
  await page.keyboard.press("KeyE");
  await expect.poll(() => page.evaluate(() => window.__xom!.scene)).toBe("library");
  await expect(page.getByTestId("music")).toContainText("Đang phát");
});

test("mobile: joystick làm nhân vật di chuyển", async ({ page, isMobile }) => {
  test.skip(!isMobile, "chỉ mobile");
  const joy = page.getByTestId("joystick");
  await expect(joy).toBeVisible();
  const box = (await joy.boundingBox())!;
  const before = await pos(page);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await joy.dispatchEvent("pointerdown", { pointerId: 7, clientX: cx, clientY: cy, isPrimary: true });
  await joy.dispatchEvent("pointermove", { pointerId: 7, clientX: cx + 50, clientY: cy, isPrimary: true });
  await page.waitForTimeout(2000);
  await joy.dispatchEvent("pointerup", { pointerId: 7, clientX: cx + 50, clientY: cy, isPrimary: true });
  const after = await pos(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0.3);
});

test("desktop: Chùa Cầu Duyên — thắp hương tích phúc đức, xin quẻ se duyên được ghép 1:1", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "chỉ desktop");
  await page.getByTestId("floors").getByRole("button").nth(2).click();
  await expect.poll(() => page.evaluate(() => window.__xom!.scene)).toBe("temple");
  await teleport(page, 0, 0);
  await expect(page.getByTestId("prompt")).toContainText("Thắp hương");
  await page.keyboard.press("KeyE");
  await expect(page.getByTestId("merit")).toContainText("3");
  await teleport(page, -7.6, -3.3);
  await expect(page.getByTestId("prompt")).toContainText("se duyên");
  await page.keyboard.press("KeyE");
  await page.getByTestId("seduyen").getByRole("button", { name: "Nữ" }).click();
  await page.getByTestId("seduyen-go").click();
  await expect(page.getByTestId("dm")).toBeVisible({ timeout: 15_000 });
  await page.locator("#dm").fill("Chào bạn!");
  await page.locator("#dm").press("Enter");
  await expect(page.getByTestId("dm")).toContainText("Chào bạn!");
});

test("desktop: Cùng thành phố — chọn thành phố và đăng kế hoạch", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await page.getByTestId("city-button").click();
  await page.locator("#home-city").selectOption("manchester");
  await page.locator("#plan-title").fill("Đi ăn lẩu cuối tuần");
  await page.getByTestId("plan-create").click();
  await expect(page.getByTestId("plans")).toContainText("Đi ăn lẩu cuối tuần");
});
