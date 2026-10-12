import type { ClassId } from "../core/types";
export interface JourneyRecord {
  classId: ClassId;
  level: number;
  time: number;
  seed: number;
  finished: boolean;
  loop?: number;
  room?: number;
  score?: number;
  testing?: boolean;
}
export function parseRecords(value: unknown): JourneyRecord[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100)
    throw new Error("旅程歷史損壞，原始資料保留。");
  return value.map((r) => {
    if (
      !r ||
      !["sword", "bow", "mage"].includes(r.classId) ||
      typeof r.finished !== "boolean" ||
      ![
        r.level,
        r.time,
        r.seed,
        ...[r.loop, r.room, r.score].filter((x) => x !== undefined),
      ].every(
        (v) =>
          typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1e12,
      ) ||
      !Number.isInteger(r.level) ||
      !Number.isInteger(r.seed) ||
      (r.testing !== undefined && typeof r.testing !== "boolean")
    )
      throw new Error("旅程歷史損壞，原始資料保留。");
    return {
      classId: r.classId,
      level: r.level,
      time: r.time,
      seed: r.seed,
      finished: r.finished,
      ...(r.loop !== undefined ? { loop: r.loop } : {}),
      ...(r.room !== undefined ? { room: r.room } : {}),
      ...(r.score !== undefined ? { score: r.score } : {}),
      ...(r.testing !== undefined ? { testing: r.testing } : {}),
    };
  });
}
export function mergeRecords(a: JourneyRecord[], b: JourneyRecord[]) {
  const unique = new Map<string, JourneyRecord>();
  for (const r of [...a, ...b])
    unique.set(`${r.classId}:${r.seed}:${r.level}:${r.time}:${r.finished}`, r);
  return [...unique.values()].slice(-100);
}
