import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const policy = JSON.parse(
  await readFile("/etc/codex/network-policy.json", "utf8"),
);
const browser = await chromium.launch({
  proxy: { server: policy.http_proxy },
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = "https://sces5504.github.io/Solaria-Remaster/preview/mobile/";
  await page.goto(url);
  await page
    .getByRole("button", { name: "開始新局", exact: true })
    .waitFor({ timeout: 60000 });
  const names = await page.evaluate(async () =>
    (await indexedDB.databases()).map((db) => db.name),
  );
  assert(names.includes("solaria-remaster-playtest-mobile"));
  assert(!names.includes("solaria-remaster"));
  await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const q = indexedDB.open("solaria-remaster", 1);
        q.onupgradeneeded = () => q.result.createObjectStore("protected");
        q.onerror = () => reject(q.error);
        q.onsuccess = () => {
          const db = q.result,
            tx = db.transaction("protected", "readwrite");
          tx.objectStore("protected").put("untouched", "marker");
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "開始新局", exact: true })
    .waitFor({ timeout: 60000 });
  const marker = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const q = indexedDB.open("solaria-remaster", 1);
        q.onerror = () => reject(q.error);
        q.onsuccess = () => {
          const db = q.result,
            request = db
              .transaction("protected")
              .objectStore("protected")
              .get("marker");
          request.onsuccess = () => {
            db.close();
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        };
      }),
  );
  assert.equal(marker, "untouched");
  assert.deepEqual(errors, []);
  const viewport = await page
    .locator('meta[name="viewport"]')
    .getAttribute("content");
  assert(viewport.includes("viewport-fit=cover"));
  const result = {
    checkedAt: new Date().toISOString(),
    url,
    names,
    formalSentinel: marker,
    viewport,
    pageErrors: errors,
    status: "PASS",
  };
  await writeFile(
    "docs/mobile-preview/results/live-isolation.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    "Independent mobile DB, untouched formal sentinel, mobile viewport metadata: PASS",
  );
} finally {
  await browser.close();
}
