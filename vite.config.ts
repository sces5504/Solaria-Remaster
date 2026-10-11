import { defineConfig } from "vite";
export default defineConfig({
  base: process.env.SOLARIA_PAGES === "1" ? "/Solaria-Remaster/" : "./",
});
