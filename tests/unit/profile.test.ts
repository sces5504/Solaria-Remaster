import { it, expect } from "vitest";
import {
  emptyProfile,
  updateProfile,
  mergeProfiles,
  parseProfile,
} from "../../src/game/persistence/profile";
import { newRun, nextLoop } from "../../src/game/core/run";
it("死後收藏保留，三職完成才能三人同行；全85卡開收藏", () => {
  let p = emptyProfile();
  for (const classId of ["sword", "bow", "mage"] as const) {
    const r = newRun(classId, 411);
    r.phase = "RUN_END";
    r.room = 31;
    p = updateProfile(p, r, []);
    expect(p.achievements.includes("threeTravelers")).toBe(classId === "mage");
  }
  const dead = newRun("mage", 413);
  dead.phase = "DEAD";
  p = updateProfile(
    p,
    dead,
    Array.from({ length: 85 }, (_, i) => i + 1),
  );
  expect(p.achievements).toContain("firstSun");
  expect(p.achievements).toContain("fullArchive");
});
it("六不同已完成災厄才解鎖，單一事件多次保存不增加數目", () => {
  const r = newRun("sword", 915);
  let p = emptyProfile();
  for (const id of [
    "christmas",
    "bloodmoon",
    "halloween",
    "alien",
    "meteor",
    "army",
  ] as const) {
    r.event = {
      id,
      theme: "meadow",
      room: 2,
      loop: 1,
      wave: 2,
      next: 0,
      waiting: false,
      boss: false,
      completed: true,
      rewarded: true,
      meteorNext: 3,
    };
    p = updateProfile(p, r, []);
    p = updateProfile(p, r, []);
    expect(p.achievements.includes("sixOmens")).toBe(id === "army");
  }
  expect(p.clearedEvents).toHaveLength(6);
});
it("周目完成成就依完成時觸發，不因進入周目而誤發", () => {
  const r = newRun("bow", 711);
  r.phase = "RUN_END";
  let p = updateProfile(emptyProfile(), r, []);
  nextLoop(r);
  p = updateProfile(p, r, []);
  expect(p.achievements).not.toContain("secondDawn");
  r.phase = "RUN_END";
  p = updateProfile(p, r, []);
  expect(p.achievements).toContain("secondDawn");
});
it("永久紀錄合併保留另一分頁的收藏，未解鎖外觀與壞資料不默默清空", () => {
  const a = emptyProfile(),
    b = emptyProfile();
  a.achievements = ["firstLord"];
  b.achievements = ["fusion"];
  expect(mergeProfiles(a, b).achievements).toEqual(["firstLord", "fusion"]);
  expect(() => parseProfile({ ...a, cosmetic: "dawn" })).toThrow(
    "原始資料保留",
  );
  expect(() => parseProfile({ ...a, achievements: ["invented"] })).toThrow(
    "原始資料保留",
  );
});
it("拒絕原型鍵外觀，永久備份僅帶收藏欄位，不能夾帶戰鬥增益", () => {
  for (const cosmetic of ["constructor", "__proto__", "toString"])
    expect(() => parseProfile({ ...emptyProfile(), cosmetic })).toThrow();
  expect(
    parseProfile({
      ...emptyProfile(),
      stats: { global: 999 },
      arbitrary: true,
    }),
  ).toEqual(emptyProfile());
});
