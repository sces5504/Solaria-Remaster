import type { ClassId, Run } from "../core/types";
export const achievements = {
  firstLord: { name: "暮光守望", description: "擊敗一位地形領主。" },
  fusion: { name: "雙星共鳴", description: "在旅途中融合兩種元素。" },
  firstSun: { name: "尋回日光", description: "擊敗索拉里斯神。" },
  threeTravelers: {
    name: "三人同行",
    description: "以三種職業各尋回一次日光。",
  },
  sixOmens: { name: "災厄見證", description: "完成六種不同災厄事件。" },
  fullArchive: { name: "星典收藏家", description: "圖鑑收錄全部85份力量。" },
  secondDawn: { name: "再度黎明", description: "完成第二周目。" },
} as const;
export type AchievementId = keyof typeof achievements;
export const cosmetics = {
  dusk: { name: "暮光", color: 0xffdf98, requirement: null },
  amber: { name: "琥珀之誓", color: 0xffb678, requirement: "firstLord" },
  dawn: { name: "黎明星芒", color: 0x99edff, requirement: "firstSun" },
} as const;
export type CosmeticId = keyof typeof cosmetics;
export interface Profile {
  version: 1;
  achievements: AchievementId[];
  clearedEvents: string[];
  completedClasses: ClassId[];
  cosmetic: CosmeticId;
  tutorialSeen: boolean;
}
export const emptyProfile = (): Profile => ({
  version: 1,
  achievements: [],
  clearedEvents: [],
  completedClasses: [],
  cosmetic: "dusk",
  tutorialSeen: false,
});
export function parseProfile(value: unknown): Profile {
  if (value === undefined) return emptyProfile();
  const p = value as Profile;
  const validArray = (v: unknown, allowed: string[]) =>
    Array.isArray(v) &&
    v.length <= allowed.length &&
    new Set(v).size === v.length &&
    v.every((x) => typeof x === "string" && allowed.includes(x));
  if (
    !p ||
    p.version !== 1 ||
    !validArray(p.achievements, Object.keys(achievements)) ||
    !validArray(p.clearedEvents, [
      "christmas",
      "bloodmoon",
      "halloween",
      "alien",
      "meteor",
      "army",
    ]) ||
    !validArray(p.completedClasses, ["sword", "bow", "mage"]) ||
    !(p.cosmetic in cosmetics) ||
    typeof p.tutorialSeen !== "boolean"
  )
    throw new Error("旅人永久紀錄損壞；原始資料保留。");
  const skin = cosmetics[p.cosmetic];
  if (skin.requirement && !p.achievements.includes(skin.requirement))
    throw new Error("旅人外觀紀錄損壞；原始資料保留。");
  return JSON.parse(JSON.stringify(p)) as Profile;
}
export function updateProfile(
  prior: Profile,
  r: Run,
  discovered: number[],
): Profile {
  const p = parseProfile(prior),
    unlocked = new Set(p.achievements);
  if (r.fusion) unlocked.add("fusion");
  if (r.settledOnce && r.room % 5 === 0) unlocked.add("firstLord");
  if (r.event?.completed)
    p.clearedEvents = [...new Set([...p.clearedEvents, r.event.id])];
  if (r.phase === "RUN_END") {
    unlocked.add("firstSun");
    p.completedClasses = [...new Set([...p.completedClasses, r.classId])];
    if ((r.loop ?? 1) >= 2) unlocked.add("secondDawn");
  }
  if (p.completedClasses.length === 3) unlocked.add("threeTravelers");
  if (p.clearedEvents.length === 6) unlocked.add("sixOmens");
  if (new Set(discovered).size === 85) unlocked.add("fullArchive");
  p.achievements = [...unlocked];
  return p;
}
export function mergeProfiles(a: Profile, b: Profile): Profile {
  return parseProfile({
    ...b,
    achievements: [...new Set([...a.achievements, ...b.achievements])],
    clearedEvents: [...new Set([...a.clearedEvents, ...b.clearedEvents])],
    completedClasses: [
      ...new Set([...a.completedClasses, ...b.completedClasses]),
    ],
    tutorialSeen: a.tutorialSeen || b.tutorialSeen,
  });
}
