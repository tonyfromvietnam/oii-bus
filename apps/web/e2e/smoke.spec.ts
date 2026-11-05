import { expect, test, type Page } from "@playwright/test";

type Pos = { x: number; z: number };
const pos = (page: Page) =>
  page.evaluate<Pos>(() => ({ x: window.__oiiBus!.player.x, z: window.__oiiBus!.player.z }));
const teleport = (page: Page, x: number, z: number) =>
  page.evaluate(([px, pz]) => Object.assign(window.__oiiBus!.player, { x: px, z: pz }), [x, z] as const);

const box = (page: Page, id: string) => page.getByTestId(id);

/** Dịch nhân vật tới một chỗ rồi đợi gợi ý hiện ra (máy CI không GPU vẽ rất chậm: đặt lại vị trí mỗi lần thử). */
async function reach(page: Page, x: number, z: number, prompt: string) {
  await expect
    .poll(
      async () => {
        await teleport(page, x, z);
        const el = page.getByTestId("prompt");
        return (await el.count()) ? await el.textContent() : "";
      },
      { timeout: 45_000, intervals: [500, 1000, 2000] },
    )
    .toContain(prompt);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/?lowfx");
  await expect(page.getByTestId("world")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForFunction(() => !!window.__oiiBus && window.__oiiBus.time > 0.5);
  // tạo nhân vật rồi lên xe
  await expect(page.getByTestId("creator")).toBeVisible();
  await page.getByTestId("go").click();
  await expect(page.getByTestId("creator")).toBeHidden();
});

test("desktop: một tầng thượng to, đi lại bằng bàn phím, thấy địa danh", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await expect(page.getByTestId("where")).toContainText(/📍|→/);
  await expect(page.getByTestId("zones").getByRole("button")).toHaveCount(7);
  const before = await pos(page);
  await page.keyboard.down("KeyD");
  // máy CI render chậm (không GPU): giữ phím tới khi nhân vật đi được một đoạn
  await expect.poll(async () => (await pos(page)).x - before.x).toBeGreaterThan(0.3);
  await page.keyboard.up("KeyD");
});

test("desktop: Oii Viet — bê phở kiếm tip, thuê phụ bếp để quầy tự chạy", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await reach(page, 15, -7.6, "Bê phở");
  await page.keyboard.press("KeyE");
  await expect(box(page, "station")).toBeVisible();
  for (let i = 0; i < 6; i++) await box(page, "station-tap").click();
  await expect(box(page, "station-count")).toHaveText("6");
  await expect(box(page, "wallet")).toContainText("£16");
  await box(page, "station-hire").click();
  await expect(box(page, "station")).toContainText("đang có 1");
  // phụ bếp tự bê, không cần bấm
  await expect
    .poll(async () => Number(await box(page, "station-count").textContent()), { timeout: 20_000 })
    .toBeGreaterThan(6);
});

test("desktop: treo máy — màn tối, các quầy vẫn chạy, thức dậy chơi tiếp", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await box(page, "afk-button").click();
  await expect(box(page, "afk")).toBeVisible();
  // treo máy là tự làm thêm ở quầy gần nhất (mặc định: bê phở)
  await expect
    .poll(async () => Number((await box(page, "afk-pho").textContent())?.replace(/\D/g, "")), {
      timeout: 20_000,
    })
    .toBeGreaterThan(0);
  await box(page, "afk-wake").click();
  await expect(box(page, "afk")).toBeHidden();
});

test("desktop: đóng app vẫn được tính bù (người giúp làm trong lúc vắng)", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    const hourAgo = Date.now() - 60 * 60_000;
    const zero = { pho: 0, nails: 0, tea: 0, essay: 0, mo: 0 };
    localStorage.setItem(
      "oii-bus:farm",
      JSON.stringify({ farm: { counts: zero, helpers: { ...zero, mo: 1 }, lastTick: hourAgo }, wallet: 0 }),
    );
  });
  await page.reload();
  await page.getByTestId("go").click();
  await expect(box(page, "away")).toBeVisible();
  await expect(box(page, "away")).toContainText("tiếng mõ");
  await expect(box(page, "away")).toContainText("+3.600");
});

test("desktop: Chùa Cầu Duyên — gõ mõ, thắp hương tích công đức, xin quẻ se duyên 1:1", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "chỉ desktop");
  await reach(page, -37.5, -5.1, "Gõ mõ");
  await page.keyboard.press("KeyE");
  for (let i = 0; i < 3; i++) await box(page, "station-tap").click();
  await expect(page.getByTestId("merit")).toContainText("3");
  await box(page, "station-close").click();
  await reach(page, -37.5, 0, "Thắp hương");
  await page.keyboard.press("KeyE");
  await expect(page.getByTestId("merit")).toContainText("6");
  await reach(page, -42.2, -4.9, "se duyên");
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

test("desktop: vòng lặp hằng ngày — chuỗi ngày, cấp, thẻ khoe", async ({ page, isMobile }) => {
  test.skip(isMobile, "chỉ desktop");
  await expect(page.getByTestId("profile-chip")).toContainText("Zone 6");
  await page.getByTestId("profile-chip").click();
  await expect(page.getByTestId("level")).toContainText("Lv");
  await page.getByTestId("make-card").click();
  await expect(page.getByTestId("share-card").locator("img")).toBeVisible();
});

test("mobile: joystick làm nhân vật di chuyển", async ({ page, isMobile }) => {
  test.skip(!isMobile, "chỉ mobile");
  const joy = page.getByTestId("joystick");
  await expect(joy).toBeVisible();
  const b = (await joy.boundingBox())!;
  const before = await pos(page);
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  await joy.dispatchEvent("pointerdown", { pointerId: 7, clientX: cx, clientY: cy, isPrimary: true });
  await joy.dispatchEvent("pointermove", { pointerId: 7, clientX: cx + 50, clientY: cy, isPrimary: true });
  await page.waitForTimeout(2000);
  await joy.dispatchEvent("pointerup", { pointerId: 7, clientX: cx + 50, clientY: cy, isPrimary: true });
  const after = await pos(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThan(0.3);
});
