import { request, chromium } from "playwright";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";
const root = "https://sces5504.github.io/Solaria-Remaster/";
const dist = resolve(process.env.DIST_DIR || "dist");
const policy = JSON.parse(
  await readFile("/etc/codex/network-policy.json", "utf8"),
);
const proxy = { server: policy.http_proxy };
const api = await request.newContext({ proxy });
const checked = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:html|js|css|png|webmanifest)$/.test(entry.name)) {
      const path = relative(dist, file);
      // Redirect document is compared without following its browser script.
      const res = await api.get(root + path);
      assert.equal(res.status(), 200, path);
      const sha256 = (b) => createHash("sha256").update(b).digest("hex");
      const expected = sha256(await readFile(file));
      assert.equal(sha256(await res.body()), expected, path);
      checked.push({ path, sha256: expected });
    }
  }
}
try {
  await walk(dist);
  const browser = await chromium.launch({
    proxy,
    args: ["--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 844, height: 390 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    });
    const errors = [],
      badResponses = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400)
        badResponses.push({ url: r.url(), status: r.status() });
    });
    await page.goto(root + "preview/mobile/?v=1.4.0", {
      waitUntil: "networkidle",
    });
    assert.equal(page.url(), root + "?v=1.4.0");
    await page.getByRole("button", { name: "開始新局", exact: true }).waitFor();
    assert(
      await page
        .locator("body")
        .evaluate((n) => n.classList.contains("mobile")),
    );
    assert.equal(await page.locator("[data-touch]").count(), 6);
    assert.deepEqual(errors, []);
    assert.deepEqual(badResponses, []);
    await page.screenshot({
      path: "docs/releases-1.4.0/results/live-mobile.png",
    });
    await writeFile(
      "docs/releases-1.4.0/results/live-integrity.json",
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          source: process.env.RELEASE_SOURCE,
          checked,
          redirect: page.url(),
          errors,
          badResponses,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `${checked.length} published HTML/JS/CSS/PNG/manifest files match SHA256; mobile redirect and menu loaded without errors.`,
    );
  } finally {
    await browser.close();
  }
} finally {
  await api.dispose();
}
