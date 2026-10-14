import { build } from "vite";
import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";

// Package the same game as a file:// document. No local server or runtime required.
const out = resolve(process.argv[2] || "release");
const work = await mkdtemp(join(tmpdir(), "solaria-download-"));
const assets = {};
for (const file of await readdir("public/assets/adventure")) {
  if (!file.endsWith(".png")) continue;
  assets[`assets/adventure/${file}`] =
    `data:image/png;base64,${(await readFile(`public/assets/adventure/${file}`)).toString("base64")}`;
}
try {
  await build({
    configFile: false,
    base: "./",
    publicDir: false,
    plugins: [
      {
        name: "solaria-download-assets",
        enforce: "pre",
        transform(code, id) {
          if (id.endsWith("/src/render/stage.ts")) {
            const original =
              "this.assetResolver?.(path) ?? `${import.meta.env.BASE_URL}${path}`";
            if (!code.includes(original))
              throw new Error(
                "Stage asset resolver changed; update download packaging",
              );
            return code.replace(
              original,
              "this.assetResolver?.(path) ?? globalThis.__SOLARIA_ASSETS__[path]",
            );
          }
          if (id.endsWith("/src/ui/view.ts")) {
            const original =
              "${import.meta.env.BASE_URL}assets/adventure/${id}.png";
            if (!code.includes(original))
              throw new Error(
                "Class portraits changed; update download packaging",
              );
            return code.replace(
              original,
              '${globalThis.__SOLARIA_ASSETS__["assets/adventure/" + id + ".png"]}',
            );
          }
          if (id.endsWith("/src/style.css"))
            return code.replace(
              /url\(["']?\/(assets\/adventure\/[^)"']+)["']?\)/g,
              (_, path) => {
                if (!assets[path]) throw new Error(`Missing asset: ${path}`);
                return `url("${assets[path]}")`;
              },
            );
        },
      },
    ],
    build: {
      outDir: work,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: "index.html",
        output: { inlineDynamicImports: true },
      },
    },
  });
  let html = await readFile(join(work, "index.html"), "utf8");
  const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
  const style = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
  if (!script || !style)
    throw new Error("Expected a single game script and stylesheet");
  const js = await readFile(join(work, script[1]), "utf8");
  const css = await readFile(join(work, style[1]), "utf8");
  html = html.replace(style[0], () => `<style>${css}</style>`);
  const inline =
    `globalThis.__SOLARIA_ASSETS__=${JSON.stringify(assets)};\n${js}`.replace(
      /<\/script/gi,
      "<\\/script",
    );
  html = html.replace(
    script[0],
    () => `<script type="module">${inline}</script>`,
  );
  html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, "");
  const { version } = JSON.parse(await readFile("package.json", "utf8"));
  const name = `Solaria-Remaster-v${version}.html`;
  await mkdir(out, { recursive: true });
  await writeFile(join(out, name), html);
  const hash = createHash("sha256").update(html).digest("hex");
  await writeFile(join(out, "SHA256SUMS.txt"), `${hash}  ${name}\n`);
  console.log(`${name}: ${Buffer.byteLength(html)} bytes, SHA256 ${hash}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
