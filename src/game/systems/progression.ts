import { gearState } from "./equipment-abilities";
import {
  hasEquipment,
  specialEquipment,
  equipmentCatalog,
  type EquipmentAbility,
} from "../data/equipment";
import { currentBiome } from "../data/biomes";
import { syncPumpkin } from "./companion";
import {
  applyEquipmentRestrictions,
  recoverHP,
  slotRestriction,
} from "./ability-policies";
import type { Run, Item, Slot, Stats } from "../core/types";
import { cards, eligible, skillFactor } from "../data/cards";
import { classes } from "../data/world";
import { random, seedFor, clamp } from "../core/primitives";
/** Smooth, diminishing growth: Lv1=1, Lv31=2.5; later loops keep growing. */
export const levelHealthFactor = (level: number) =>
  1 + 1.5 * (Math.max(0, level - 1) / 30) ** 0.9;
export function normalizeLevelHealth(r: Run) {
  if (r.healthGrowthVersion === 1) return;
  const oldMax = r.stats.maxHP;
  r.stats = derive(r);
  if (r.player.hp > 0) recoverHP(r, Math.max(0, r.stats.maxHP - oldMax));
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP);
  r.healthGrowthVersion = 1;
  r.stats = derive(r);
}
export function derive(r: Run): Stats {
  const gear = gearState(r);
  const criticalBase = hasEquipment(r, "frostBell") ? 0.25 : 0.15;
  const c = classes[r.classId],
    l = (id: number) => r.cards[id] || 0;
  const s: Stats = {
    maxHP: c.hp * (1 + (l(84) ? 0.8 : 0)),
    armor:
      c.armor +
      l(2) * 8 +
      (hasEquipment(r, "meteorArmor") && gear.standingArmor ? 35 : 0) +
      (l(84) ? 60 : 0),
    basic: l(3) * 0.15 + (l(83) ? 1.2 : 0),
    skill: l(4) * 0.1 + (l(82) ? 0.6 : 0),
    global:
      l(14) * 0.15 +
      (l(81) ? 1 : 0) +
      (l(66) && (r.momentum?.until ?? 0) > r.time
        ? r.momentum!.stacks * 0.025 * skillFactor(l(66), 1)
        : 0),
    elemental: l(12) * 0.18,
    attackRate: 0,
    skillCD: 0,
    speed: 0,
    projectile: 1 + l(7) * 0.1,
    range: 1.15 + l(13) * 0.2,
    crit: criticalBase + l(10) * 0.05,
    critMult: 1.5 + l(11) * 0.15,
    xp: 1 + l(8) * 0.1,
    lifesteal: l(79) ? 0.06 : 0,
    reduction: l(27)
      ? Math.min(0.5, 0.1 + (skillFactor(l(27), 1) - 1) * 0.02)
      : 0,
  };
  let A =
      l(5) * 0.12 +
      (l(83) ? 1 : 0) +
      (l(69) && (r.player.recoveryUntil ?? 0) > r.time
        ? 0.25 * skillFactor(l(69), 1)
        : 0) +
      (r.time < r.player.buffUntil ? 0.3 + Math.min(4, l(53) - 1) * 0.05 : 0),
    C = l(9) * 0.1 + (l(78) ? 4 : 0),
    M =
      (hasEquipment(r, "voidCloth") && gear.voidUntil > r.time ? 0.3 : 0) +
      (r.time < r.player.engineUntil ? 0.5 : 0);
  for (const item of Object.values(r.equipment))
    if (item)
      for (const aff of item.affixes) {
        switch (aff.stat) {
          case "hp":
            s.maxHP += aff.value;
            break;
          case "armor":
            s.armor += aff.value;
            break;
          case "speed":
            M += aff.value;
            break;
          case "rate":
            A += aff.value;
            break;
          case "cd":
            C += aff.value;
            break;
          case "crit":
            s.crit += criticalBase * aff.value;
            break;
          case "critMult":
            s.critMult += aff.value;
            break;
          case "range":
            s.range += aff.value;
            break;
          case "xp":
            s.xp += aff.value;
            break;
          case "projectile":
            s.projectile += aff.value;
            break;
          default:
            if (aff.stat in s)
              (s as unknown as Record<string, number>)[aff.stat] += aff.value;
        }
      }
  s.maxHP *= 1.1 ** l(1) * levelHealthFactor(r.level);
  if (l(73) && r.player.hp >= s.maxHP * 0.8) s.armor += 40;
  s.attackRate = c.rate * (1 + (4 * A) / (1 + A));
  s.skillCD = c.cd * (0.2 + 0.8 / (1 + C));
  s.speed = 200 * (1 + M / (1 + M) + l(6) * 0.1);
  s.crit = clamp(s.crit, 0, 1);
  return s;
}
export function drawChoices(r: Run, fresh = true) {
  if (fresh) r.rerollUsed = false;
  const state = { rng: r.cardRng };
  const picked: number[] = [];
  for (let i = 0; i < 3; i++) {
    const pool = cards.filter((c) => eligible(r, c) && !picked.includes(c.id));
    const colors = ["藍", "紫", "青", "黃", "橘", "紅"];
    const base = r.elements.length
      ? [40, 25, 18, 12, 4, 1]
      : [29, 18, 40, 9, 3, 1];
    const weights = colors.map((color, j) =>
      pool.some((c) => c.rarity === color)
        ? base[j] * (r.cards[85] && j >= 4 ? 2 : 1)
        : 0,
    );
    let roll = random(state) * weights.reduce((a, b) => a + b, 0),
      color = "藍";
    for (let j = 0; j < weights.length; j++) {
      roll -= weights[j];
      if (roll < 0) {
        color = colors[j];
        break;
      }
    }
    const candidates = pool.filter((c) => c.rarity === color);
    const boost = ![16, 23, 29].some((id) => r.cards[id]);
    const ws = candidates.map(
      (c) =>
        (c.id >= 32 && c.id <= 40 ? 1.25 : 1) *
        (boost && [16, 23, 29].includes(c.id) ? 2 : 1),
    );
    roll = random(state) * ws.reduce((a, b) => a + b, 0);
    let idx = 0;
    for (; idx < ws.length - 1; idx++) {
      roll -= ws[idx];
      if (roll < 0) break;
    }
    if (candidates[idx]) picked.push(candidates[idx].id);
  }
  r.cardRng = state.rng;
  r.choices = picked;
}
export function reroll(r: Run) {
  if (r.phase !== "UPGRADE_CHOICE" || r.rerollUsed) return false;
  drawChoices(r, false);
  r.rerollUsed = true;
  return true;
}
function acquire(r: Run, id: number) {
  const old = r.stats.maxHP;
  r.cards[id] = (r.cards[id] || 0) + 1;
  const el = ({ 15: "ice", 19: "fire", 24: "water", 28: "lightning" } as const)[
    id as 15
  ];
  if (el && !r.elements.includes(el)) r.elements.push(el);
  if (!r.fusion) {
    const options: NonNullable<Run["fusion"]>[] = [];
    if (r.elements.includes("water") && r.elements.includes("fire"))
      options.push("steam");
    if (r.elements.includes("water") && r.elements.includes("lightning"))
      options.push("storm");
    if (r.elements.includes("ice") && r.elements.includes("fire"))
      options.push("frostfire");
    if (options.length === 1) r.fusion = options[0];
    else if (options.length > 1) r.fusionChoices = options;
  }
  if (id === 85) {
    r.selectedEquipmentSlot = undefined;
    for (const slot of ["armor", "ring", "amulet"] as Slot[]) {
      const item = r.equipment[slot];
      if (!item) continue;
      delete r.equipment[slot];
      if (r.bag.length < 12) r.bag.push(item);
      else r.items.push({ ...item, x: r.player.x, y: r.player.y });
    }
  }
  if (id === 80 || (id === 85 && r.selectedEquipmentSlot))
    applyEquipmentRestrictions(r);
  if (id === 83) {
    r.player.rapid.remaining = 0;
    r.player.counterAt = 0;
    r.player.pendingEcho = undefined;
    r.player.pendingEchoes = [];
    r.player.echoRapid = undefined;
    r.player.buffUntil = 0;
    r.player.engineUntil = 0;
  }
  r.stats = derive(r);
  syncPumpkin(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP * (r.cards[79] ? 0.4 : 1));
  recoverHP(r, Math.max(0, r.stats.maxHP - old));
}
export function choose(r: Run, id: number) {
  if (r.phase !== "UPGRADE_CHOICE" || !r.choices.includes(id)) return false;
  acquire(r, id);
  r.pendingLevels--;
  r.choices = [];
  if (r.fusionChoices?.length) r.phase = "FUSION_CHOICE";
  else if (r.pendingLevels > 0) drawChoices(r);
  else r.phase = r.room === 31 ? "RUN_END" : "POST_CLEAR";
  return true;
}
export function itemFor(
  r: Run,
  enemyId: number,
  bossIndex = -1,
  testTemplate?: EquipmentAbility,
): Item | null {
  const state = {
    rng: seedFor(
      r.seed,
      r.room * 10000 + enemyId * 3 + bossIndex + ((r.loop ?? 1) - 1) * 1000000,
    ),
  };
  const enemy = r.enemies.find((e) => e.id === enemyId);
  if (
    bossIndex < 0 &&
    random(state) >
      (enemy?.elite ? (hasEquipment(r, "starSeeker") ? 0.4 : 0.3) : 0.04)
  )
    return null;
  const w = [60, 25, 10, 4, 1].map(
    (v, i) => v * (i > 0 ? 1 + r.modifiers.length * 0.25 : 1),
  );
  let roll = random(state) * w.reduce((a, b) => a + b, 0),
    quality = 0;
  for (; quality < 4; quality++) {
    roll -= w[quality];
    if (roll < 0) break;
  }
  if (bossIndex === 0) quality = Math.max(1, quality);
  if (testTemplate)
    quality = equipmentCatalog[testTemplate].rarity === "紅" ? 4 : 3;
  const slot = testTemplate
    ? equipmentCatalog[testTemplate].slot
    : (["armor", "ring", "amulet"] as Slot[])[Math.floor(random(state) * 3)];
  const statPool = [
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
  ];
  const ranges: Record<string, [number, number]> = {
    hp: [20, 40],
    armor: [6, 12],
    basic: [0.05, 0.1],
    skill: [0.05, 0.1],
    elemental: [0.05, 0.1],
    global: [0.03, 0.06],
    rate: [0.06, 0.1],
    cd: [0.05, 0.1],
    crit: [0.1, 0.2],
    critMult: [0.1, 0.2],
    speed: [0.03, 0.06],
    range: [0.05, 0.1],
    projectile: [0.05, 0.1],
    xp: [0.03, 0.06],
    lifesteal: [0.001, 0.003],
  };
  const affixes: { stat: string; value: number }[] = [];
  const first =
    slot === "armor"
      ? random(state) < 0.5
        ? "hp"
        : "armor"
      : slot === "ring"
        ? "global"
        : "skill";
  const affixCount = [1, 2, 3, 3, 2][quality];
  const terrainScale = 1 + currentBiome(r).tier * 0.2;
  const loopScale = 1.35 ** ((r.loop ?? 1) - 1);
  for (let i = 0; i < affixCount; i++) {
    const candidates = statPool.filter(
      (s) => !affixes.some((a) => a.stat === s),
    );
    const stat =
      i === 0
        ? first
        : candidates[Math.floor(random(state) * candidates.length)];
    const [lo, hi] = ranges[stat];
    affixes.push({
      stat,
      value:
        (lo + (hi - lo) * random(state)) *
        (1 + quality * 0.2) *
        (stat === "lifesteal" ? 1 : terrainScale * loopScale),
    });
  }
  const base: Item = {
    id: `${r.runId}-${r.loop ?? 1}-${r.room}-${enemyId}-${bossIndex}`,
    slot,
    rarity: ["藍", "紫", "黃", "橘", "紅"][quality],
    affixes,
    x: enemy?.x ?? 760,
    y: enemy?.y ?? 320,
  };
  if (testTemplate)
    return {
      ...base,
      ability: testTemplate,
      name: equipmentCatalog[testTemplate].name,
    };
  return quality >= 3
    ? specialEquipment(state, slot, quality === 3 ? "橘" : "紅", base)
    : base;
}
export function pickup(r: Run, targetId?: string) {
  if (!["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r.phase)) return false;
  const sorted = r.items
    .filter((i) => targetId === undefined || i.id === targetId)
    .sort(
      (a, b) =>
        Math.hypot(a.x - r.player.x, a.y - r.player.y) -
          Math.hypot(b.x - r.player.x, b.y - r.player.y) ||
        a.id.localeCompare(b.id),
    );
  const item = sorted[0];
  if (!item || Math.hypot(item.x - r.player.x, item.y - r.player.y) > 64)
    return false;
  if (r.bag.length >= 12) {
    r.message = "bagFull";
    return false;
  }
  r.items = r.items.filter((i) => i.id !== item.id);
  r.bag.push(item);
  return true;
}
export function equip(r: Run, id: string) {
  if (r.phase !== "POST_CLEAR") return false;
  const index = r.bag.findIndex((i) => i.id === id);
  if (index < 0) return false;
  if (slotRestriction(r, r.bag[index].slot)) return false;
  const item = r.bag[index],
    previous = r.equipment[item.slot];
  r.bag.splice(index, 1);
  if (previous) r.bag.push(previous);
  r.equipment[item.slot] = item;
  gearState(r);
  r.stats = derive(r);
  syncPumpkin(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP * (r.cards[79] ? 0.4 : 1));
  return true;
}
export function discard(r: Run, id: string) {
  if (r.phase !== "POST_CLEAR") return false;
  let item = r.bag.find((i) => i.id === id);
  r.bag = r.bag.filter((i) => i.id !== id);
  if (!item)
    for (const slot of ["armor", "ring", "amulet"] as Slot[])
      if (r.equipment[slot]?.id === id) {
        item = r.equipment[slot];
        delete r.equipment[slot];
      }
  if (!item) return false;
  r.items.push({ ...item, x: r.player.x, y: r.player.y });
  gearState(r);
  r.stats = derive(r);
  syncPumpkin(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP * (r.cards[79] ? 0.4 : 1));
  return true;
}

/** Testing grants retain normal class and two-element rules; no level/choice is consumed. */
export function grantTestCard(r: Run, id: number) {
  r.testing = true;
  const priorPhase = r.phase;
  const card = cards.find((c) => c.id === id);
  if ((id === 78 && r.cards[83]) || (id === 83 && r.cards[78])) return false;
  if (!card || ["DEAD", "RUN_END"].includes(r.phase)) return false;
  if (
    id > 14 &&
    (r.cards[id] || 0) >=
      ([15, 19, 24, 28].includes(id) || id >= 70 ? 1 : 5 * (r.loop ?? 1))
  )
    return false;
  if (card.classId && card.classId !== r.classId) {
    for (const c of cards) if (c.classId) delete r.cards[c.id];
    r.classId = card.classId;
    r.areas = r.areas.filter((a) => a.enemy);
    r.projectiles = r.projectiles.filter((p) => p.enemy);
    r.player.rapid.remaining = 0;
    r.player.counterAt = 0;
    r.player.skillReady = r.time;
    r.player.blockUntil = r.player.buffUntil = r.player.engineUntil = 0;
  }
  const required =
    id >= 15 && id <= 18
      ? [15]
      : id <= 23 && id >= 19
        ? [19]
        : id >= 24 && id <= 27
          ? [24]
          : id >= 28 && id <= 31
            ? [28]
            : id >= 32 && id <= 34
              ? [24, 19]
              : id >= 35 && id <= 37
                ? [24, 28]
                : id >= 38 && id <= 40
                  ? [15, 19]
                  : id === 12 && !r.elements.length
                    ? [19]
                    : id === 74 && r.elements.length < 2
                      ? [15, 19]
                      : [];
  const awakenings = [15, 19, 24, 28];
  const union = new Set([...awakenings.filter((n) => r.cards[n]), ...required]);
  if (union.size > (r.cards[80] ? 3 : 2)) {
    for (const c of cards) if (c.id >= 15 && c.id <= 40) delete r.cards[c.id];
    r.elements = [];
    r.fusion = null;
    // Clear old fields/projectiles so replaced element builds cannot persist as attacks.
    r.areas = r.areas.filter((a) => a.enemy);
    r.projectiles = r.projectiles.filter((p) => p.enemy);
  }
  for (const n of required) if (n !== id && !r.cards[n]) acquire(r, n);
  acquire(r, id);
  if (r.fusionChoices?.length) {
    r.specialResumePhase = priorPhase;
    r.phase = "FUSION_CHOICE";
  }
  if (
    r.phase === "UPGRADE_CHOICE" &&
    r.choices.some(
      (n) =>
        !eligible(
          r,
          cards.find((c) => c.id === n)!,
        ),
    )
  )
    drawChoices(r, false);
  return true;
}

export function finishSpecialChoice(r: Run) {
  if (r.specialResumePhase) {
    r.phase = r.specialResumePhase;
    r.specialResumePhase = undefined;
    if (r.phase === "UPGRADE_CHOICE") drawChoices(r, false);
    return;
  }
  if (r.pendingLevels > 0) {
    r.phase = "UPGRADE_CHOICE";
    drawChoices(r);
  } else r.phase = r.room === 31 ? "RUN_END" : "POST_CLEAR";
}
export function chooseFusion(r: Run, fusion: NonNullable<Run["fusion"]>) {
  if (r.phase !== "FUSION_CHOICE" || !r.fusionChoices?.includes(fusion))
    return false;
  r.fusion = fusion;
  r.fusionChoices = [];
  finishSpecialChoice(r);
  return true;
}
export function chooseEquipmentSlot(r: Run, slot: Slot) {
  if (
    r.phase !== "EQUIPMENT_SLOT_CHOICE" ||
    !["armor", "ring", "amulet"].includes(slot)
  )
    return false;
  r.selectedEquipmentSlot = slot;
  applyEquipmentRestrictions(r);
  r.stats = derive(r);
  syncPumpkin(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP * (r.cards[79] ? 0.4 : 1));
  finishSpecialChoice(r);
  return true;
}
