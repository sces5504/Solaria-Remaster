const build = import.meta.env.VITE_PLAYTEST;
const preview = build === "terrain-1.3.0" || build === "mobile";
export const storageKey = (key: string) =>
  preview
    ? `${key}-playtest-${build === "mobile" ? "mobile" : "terrain-1.3.0"}`
    : key;
export const playtestBuild = preview;
