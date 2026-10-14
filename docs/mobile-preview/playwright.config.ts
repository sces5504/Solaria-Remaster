import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "mobile.spec.ts",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: "../../test-results/mobile",
  use: {
    baseURL: process.env.MOBILE_TEST_URL || "http://127.0.0.1:4173",
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  webServer: process.env.MOBILE_TEST_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173 --strictPort",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
      },
  projects: [
    {
      name: "android",
      use: {
        browserName: "chromium",
        viewport: { width: 844, height: 390 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
      },
    },
    {
      name: "iphone",
      use: {
        browserName: "webkit",
        launchOptions: {
          args: [],
          executablePath: process.env.SOLARIA_WEBKIT_EXECUTABLE,
        },
        viewport: { width: 852, height: 393 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1280, height: 900 } },
    },
  ],
});
