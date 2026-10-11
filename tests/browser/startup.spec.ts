import { test, expect } from "@playwright/test";

test("開啟畫布且沒有程式錯誤", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Solaria Remaster" }),
  ).toBeVisible();
  await expect(page.getByLabel("遊戲畫布")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("#game").evaluate((element) => {
        const canvas = element as HTMLCanvasElement;
        return canvas.getContext("2d")?.getImageData(0, 0, 1, 1).data[3];
      }),
    )
    .toBe(255);
  expect(errors).toEqual([]);
});
