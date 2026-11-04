import { expect, test, type Page } from "@playwright/test";

type Pos = { x: number; z: number };
const pos = (page: Page) =>
  page.evaluate<Pos>(() => ({ x: window.__xom!.player.x, z: window.__xom!.player.z }));

test.beforeEach(async ({ page }) => {
  await page.goto("/?time=17:00");
  await expect(page.getByTestId("street")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => !!window.__xom && window.__xom.time > 0.5);
});

test("desktop: trang load và nhân vật đi được bằng bàn phím", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  const before = await pos(page);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(2000);
  await page.keyboard.up("KeyW");
  const after = await pos(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0.3);
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
  await joy.dispatchEvent("pointermove", { pointerId: 7, clientX: cx, clientY: cy - 50, isPrimary: true });
  await page.waitForTimeout(2000);
  await joy.dispatchEvent("pointerup", { pointerId: 7, clientX: cx, clientY: cy - 50, isPrimary: true });
  const after = await pos(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0.3);
});

test("tương tác E ở bốt điện thoại", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await page.evaluate(() => {
    const g = window.__xom!;
    g.player.x = -5;
    g.player.z = 5.2;
  });
  await expect(page.getByTestId("prompt")).toContainText("Gọi về nhà");
  await page.keyboard.press("KeyE");
  await expect.poll(() => page.evaluate(() => window.__xom!.player.bubble?.text)).toContain("Ring ring");
});
