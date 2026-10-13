const preview = import.meta.env.VITE_PLAYTEST === "terrain-1.3.0";
export const storageKey = (key: string) =>
  preview ? `${key}-playtest-terrain-1.3.0` : key;
export const playtestBuild = preview;
