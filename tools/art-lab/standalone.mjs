import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const destination = resolve(process.argv[2] ?? "/workspace/art-delivery");
const result = await build({
  configFile: false,
  base: "./",
  publicDir: false,
  build: {
    write: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: "art-lab.html",
      output: { inlineDynamicImports: true },
    },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(
  (r) => r.output,
);
const js = outputs
  .filter((o) => o.type === "chunk")
  .map((o) => o.code)
  .join("\n");
const css = outputs
  .filter((o) => o.type === "asset" && o.fileName.endsWith(".css"))
  .map((o) => o.source)
  .join("\n");
const map = {};
for (const path of [
  "solaria-atlas.png",
  "biome-atlas.png",
  "boss-atlas.png",
  "event-atlas.png",
  "biome-atlas.json",
  "boss-atlas.json",
  "event-atlas.json",
  "art-lab/adventure.png",
  "art-lab/gothic.png",
  "art-lab/sculpted.png",
]) {
  const data = await readFile("public/assets/" + path);
  map["assets/" + path] =
    `data:${path.endsWith(".json") ? "application/json" : "image/png"};base64,${data.toString("base64")}`;
}
const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><title>Solaria · 像素美術選樣</title><style>${css}</style></head><body><div id="app"></div><script>window.solariaArtAssets=${JSON.stringify(map)};</script><script type="module">${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
await mkdir(destination, { recursive: true });
await writeFile(resolve(destination, "Solaria-Art-Review.html"), html);
console.log(
  `Standalone review: ${destination}/Solaria-Art-Review.html (${Buffer.byteLength(html)} bytes)`,
);
