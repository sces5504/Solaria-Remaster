import { defineConfig } from "vite";
export default defineConfig({
  base: process.env.SOLARIA_PAGES === "1" ? "/Solaria-Remaster/" : "./",
  build: {
    rollupOptions: { input: { game: "index.html", art: "art-lab.html" } },
  },
});
