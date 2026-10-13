import {
  derive,
  finishSpecialChoice,
  normalizeLevelHealth,
} from "../systems/progression";
import { normalizeBossProjectileDamage } from "../systems/boss-balance";
import { normalizeBossMinions } from "../data/world";
import { normalizePumpkinHealth } from "../systems/companion";
import { normalizeCover } from "../systems/cover";
import { parseProfile, type Profile } from "./profile";
import { parseRecords, type JourneyRecord } from "./records";
import { eventDefinitions } from "../data/events";
import { equipmentCatalog } from "../data/equipment";
import { biomes } from "../data/biomes";
import { restoreJourney } from "../data/journey";
import type { Run } from "../core/types";
import { clone } from "../core/primitives";
import { cards, eligible } from "../data/cards";
export interface Saved {
  version: 1;
  revision: number;
  current: Run;
  entry: Run;
  discovered?: number[];
  profile?: Profile;
  records?: JourneyRecord[];
}
export function validate(value: unknown): Saved {
  if (!value || typeof value !== "object") throw new Error("存檔不是有效資料");
  const s = value as Saved;
  if (s.version !== 1 || !Number.isInteger(s.revision) || s.revision < 0)
    throw new Error("不支援的存檔版本");
  function inspect(v: unknown, depth = 0): void {
    if (depth > 25) throw new Error("存檔結構過深");
    if (typeof v === "number" && (!Number.isFinite(v) || Math.abs(v) > 1e12))
      throw new Error("存檔數值超出範圍");
    if (typeof v === "string" && v.length > 500)
      throw new Error("存檔字串過長");
    if (Array.isArray(v)) {
      if (v.length > 6000) throw new Error("存檔物件過多");
      for (const x of v) inspect(x, depth + 1);
    } else if (v && typeof v === "object")
      for (const [k, x] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          throw new Error("存檔欄位不合法");
        inspect(x, depth + 1);
      }
  }
  inspect(s);
  if (
    s.discovered !== undefined &&
    (!Array.isArray(s.discovered) ||
      s.discovered.some((id) => !cards.some((c) => c.id === id)))
  )
    throw new Error("圖鑑資料損壞");
  if (s.profile !== undefined) parseProfile(s.profile);
  if (s.records !== undefined) parseRecords(s.records);
  for (const r of [s.current, s.entry]) {
    if (
      !r ||
      r.version !== 1 ||
      !["sword", "bow", "mage"].includes(r.classId) ||
      ![
        "ROOM_INTRO",
        "COMBAT",
        "SETTLEMENT",
        "UPGRADE_CHOICE",
        "FUSION_CHOICE",
        "EQUIPMENT_SLOT_CHOICE",
        "POST_CLEAR",
        "RUN_END",
        "DEAD",
      ].includes(r.phase)
    )
      throw new Error("存檔狀態損壞");
    if (
      !Number.isInteger(r.seed) ||
      !Number.isInteger(r.room) ||
      r.room < 1 ||
      r.room > 31 ||
      !Number.isFinite(r.player?.hp) ||
      r.player.hp < 0 ||
      !Number.isFinite(r.time)
    )
      throw new Error("存檔數值損壞");
    if (
      r.loop !== undefined &&
      (!Number.isInteger(r.loop) || r.loop < 1 || r.loop > 1000000)
    )
      throw new Error("周目資料損壞");
    if (
      r.seenEvents !== undefined &&
      (!Array.isArray(r.seenEvents) ||
        r.seenEvents.length > 6 ||
        new Set(r.seenEvents).size !== r.seenEvents.length ||
        r.seenEvents.some(
          (id) =>
            typeof id !== "string" || !Object.hasOwn(eventDefinitions, id),
        ))
    )
      throw new Error("災厄紀錄損壞");
    if (
      r.eventCounter !== undefined &&
      (!Number.isInteger(r.eventCounter) ||
        r.eventCounter < 0 ||
        r.eventCounter > 10)
    )
      throw new Error("災厄計數損壞");
    if (r.event) {
      const e = r.event;
      if (
        !Object.hasOwn(eventDefinitions, e.id) ||
        e.room !== r.room ||
        e.loop !== (r.loop ?? 1) ||
        r.room % 5 === 0 ||
        r.room === 31 ||
        e.theme !== eventDefinitions[e.id].theme ||
        !r.seenEvents?.includes(e.id) ||
        !Number.isInteger(e.wave) ||
        e.wave < 0 ||
        e.wave > (eventDefinitions[e.id].boss ? 3 : 2) ||
        [e.waiting, e.boss, e.completed, e.rewarded].some(
          (x) => typeof x !== "boolean",
        ) ||
        e.boss !== (e.wave === 3 && !e.waiting) ||
        e.rewarded !== e.completed ||
        !Number.isFinite(e.next) ||
        !Number.isFinite(e.meteorNext)
      )
        throw new Error("災厄進度損壞");
    }
    if (r.biome !== undefined && !Object.hasOwn(biomes, r.biome))
      throw new Error("地形資料損壞");
    if (
      r.journey !== undefined &&
      (!Array.isArray(r.journey) ||
        r.journey.length !== 6 ||
        r.journey.some(
          (seg) =>
            !seg ||
            !Object.hasOwn(biomes, seg.biome) ||
            !Array.isArray(seg.templates) ||
            seg.templates.length !== 4 ||
            new Set(seg.templates).size !== 4 ||
            seg.templates.some(
              (t) =>
                !Number.isInteger(t) ||
                t < 0 ||
                t >= biomes[seg.biome].themes.length,
            ) ||
            !Number.isInteger(seg.boss) ||
            seg.boss < 1 ||
            seg.boss > 18,
        ))
    )
      throw new Error("秘境路線損壞");
    if (
      !Array.isArray(r.bag) ||
      r.bag.length > 12 ||
      !Array.isArray(r.items) ||
      !Array.isArray(r.elements) ||
      r.elements.length > (r.cards[80] ? 3 : 2)
    )
      throw new Error("背包或元素數量損壞");
    for (const field of [
      "enemies",
      "projectiles",
      "areas",
      "modes",
      "obstacles",
      "drops",
      "visuals",
      "templates",
      "choices",
      "modifiers",
    ] as const)
      if (!Array.isArray(r[field])) throw new Error("存檔缺少必要陣列");
    if (
      r.scenery !== undefined &&
      (!Array.isArray(r.scenery) ||
        r.scenery.some(
          (f) =>
            ![
              "gravel",
              "flowers",
              "dunes",
              "snow",
              "ash",
              "leaves",
              "fungi",
              "cracks",
              "veins",
              "stars",
              "paving",
              "rubble",
            ].includes(f.kind) ||
            !Array.isArray(f.points) ||
            f.points.some(
              (p) => !Number.isFinite(p.x) || !Number.isFinite(p.y),
            ) ||
            !Number.isFinite(f.width) ||
            f.width <= 0 ||
            (f.path !== undefined && typeof f.path !== "boolean"),
        ))
    )
      throw new Error("房間地面裝飾資料損壞");
    if (
      r.roomEntryLevel !== undefined &&
      (!Number.isInteger(r.roomEntryLevel) || r.roomEntryLevel < 1)
    )
      throw new Error("房間成長資料損壞");
    if (
      r.obstacles.some(
        (o) => o.blocksDash !== undefined && typeof o.blocksDash !== "boolean",
      )
    )
      throw new Error("地形通行資料損壞");
    for (const item of [...r.items, ...r.bag, ...Object.values(r.equipment)]) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !["armor", "ring", "amulet"].includes(item.slot) ||
        !["藍", "紫", "黃", "橘", "紅"].includes(item.rarity) ||
        !Array.isArray(item.affixes)
      )
        throw new Error("裝備資料損壞");
      for (const aff of item.affixes)
        if (
          ![
            "hp",
            "armor",
            "basic",
            "skill",
            "elemental",
            "global",
            "rate",
            "cd",
            "crit",
            "critMult",
            "speed",
            "range",
            "projectile",
            "xp",
            "lifesteal",
          ].includes(aff.stat) ||
          !Number.isFinite(aff.value)
        )
          throw new Error("裝備詞條損壞");
    }
    const ids = [...r.bag, ...r.items, ...Object.values(r.equipment)]
      .filter(Boolean)
      .map((i) => i!.id);
    if (new Set(ids).size !== ids.length) throw new Error("存檔含重複物品");
    if (r.rerollUsed !== undefined && typeof r.rerollUsed !== "boolean")
      throw new Error("刷新資料損壞");
    if (r.cards[78] && r.cards[83]) throw new Error("互斥卡片資料損壞");
    if (
      r.selectedEquipmentSlot !== undefined &&
      !["armor", "ring", "amulet"].includes(r.selectedEquipmentSlot)
    )
      throw new Error("裝備欄選擇損壞");
    if (
      r.phase === "FUSION_CHOICE" &&
      (!Array.isArray(r.fusionChoices) ||
        r.fusionChoices.length < 2 ||
        r.fusionChoices.some(
          (f) => !["steam", "storm", "frostfire"].includes(f),
        ))
    )
      throw new Error("融合選擇損壞");
    if (r.phase === "EQUIPMENT_SLOT_CHOICE" && !r.cards[85])
      throw new Error("裝備選擇損壞");
    if (
      r.roomEntryLevel !== undefined &&
      (!Number.isInteger(r.roomEntryLevel) || r.roomEntryLevel < 1)
    )
      throw new Error("房間成長資料損壞");
    if (
      r.obstacles.some(
        (o) => o.blocksDash !== undefined && typeof o.blocksDash !== "boolean",
      )
    )
      throw new Error("地形通行資料損壞");
    for (const item of [...r.items, ...r.bag, ...Object.values(r.equipment)]) {
      if (!item) continue;
      const d = item.ability ? equipmentCatalog[item.ability] : undefined;
      if (
        item.ability &&
        (!d || d.slot !== item.slot || d.rarity !== item.rarity)
      )
        throw new Error("特殊裝備資料損壞");
      if (["橘", "紅"].includes(item.rarity) && !d)
        throw new Error("特殊裝備缺少能力");
    }
    for (const [id, l] of Object.entries(r.cards)) {
      if (
        !cards.some((c) => c.id === Number(id)) ||
        !Number.isInteger(l) ||
        l < 1 ||
        (Number(id) >= 70 && l !== 1)
      )
        throw new Error("卡片資料損壞");
    }
    if (
      r.phase === "UPGRADE_CHOICE" &&
      (!Array.isArray(r.choices) ||
        r.choices.length !== 3 ||
        new Set(r.choices).size !== 3 ||
        r.choices.some((id) => {
          const c = cards.find((c) => c.id === id);
          return !c || !eligible(r, c);
        }))
    )
      throw new Error("選卡資料損壞");
  }
  const migrated = JSON.parse(JSON.stringify(s)) as Saved;
  for (const r of [migrated.current, migrated.entry]) {
    if (r.cards[85] && r.phase === "EQUIPMENT_SLOT_CHOICE") {
      for (const slot of ["armor", "ring", "amulet"] as const) {
        const item = r.equipment[slot];
        if (!item) continue;
        delete r.equipment[slot];
        if (r.bag.length < 12) r.bag.push(item);
        else r.items.push({ ...item, x: r.player.x, y: r.player.y });
      }
      r.selectedEquipmentSlot = undefined;
      finishSpecialChoice(r);
    }
    normalizeLevelHealth(r);
    restoreJourney(r);
    normalizeCover(r);
    normalizeBossProjectileDamage(r);
    normalizePumpkinHealth(r);
    normalizeBossMinions(r);
    if (r.cards[79]) {
      r.stats = derive(r);
      r.player.hp = Math.min(r.player.hp, r.stats.maxHP * 0.4);
    }
  }
  // JSON roundtrip strips prototypes. Strings are never inserted as HTML by UI.
  return migrated;
}
