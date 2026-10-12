// Asset export only: exact nearest-neighbour sampling, no repainting or masking.
// Imagegen originals remain in source-atlases and generated_images for provenance.
import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir, copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve("public/assets/adventure");
const archive = resolve("tools/adventure/source-atlases");
await mkdir(archive, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:5175");
const files = [
  ...Array.from({ length: 8 }, (_, i) => `actors-${i}.png`),
  "heroes.png",
  "floors.png",
  "world-0.png",
  "world-1.png",
  "effects.png",
  "landmarks.png",
  "menu.png",
];
const report = [];
for (const file of files) {
  const source = resolve(archive, file);
  try {
    await stat(source);
  } catch {
    await copyFile(resolve(root, file), source);
  }
  const original = await readFile(source);
  const result = await page.evaluate(
    async ({ base64, menu }) => {
      const im = new Image();
      im.src = `data:image/png;base64,${base64}`;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = menu ? 1152 : 768;
      c.height = menu ? 768 : 512;
      const ctx = c.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(im, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] === 0) clear++;
      return {
        png: c.toDataURL("image/png").split(",")[1],
        width: c.width,
        height: c.height,
        clearFraction: clear / (c.width * c.height),
      };
    },
    { base64: original.toString("base64"), menu: file === "menu.png" },
  );
  const png = Buffer.from(result.png, "base64");
  await writeFile(resolve(root, file), png);
  report.push({
    file,
    width: result.width,
    height: result.height,
    clearFraction: result.clearFraction,
    sourceBytes: original.length,
    runtimeBytes: png.length,
  });
}
const actors = await readFile(resolve(archive, "heroes-authored-weapons.png"));
for (const [name, col, row] of [
  ["sword", 0, 0],
  ["bow", 0, 1],
  ["mage", 0, 2],
]) {
  const png = await page.evaluate(
    async ({ base64, col, row }) => {
      const im = new Image();
      im.src = `data:image/png;base64,${base64}`;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      c.getContext("2d").imageSmoothingEnabled = false;
      const cell = im.width / 6;
      c.getContext("2d").drawImage(
        im,
        col * cell,
        row * cell,
        cell,
        cell,
        0,
        0,
        128,
        128,
      );
      return c.toDataURL("image/png").split(",")[1];
    },
    { base64: actors.toString("base64"), col, row },
  );
  await writeFile(resolve(root, `${name}.png`), Buffer.from(png, "base64"));
}
await browser.close();
await writeFile(
  resolve("docs/art-upgrade/atlas-export.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    report.map((r) => ({
      file: r.file,
      bytes: r.runtimeBytes,
      alpha: r.clearFraction,
    })),
    null,
    2,
  ),
);
