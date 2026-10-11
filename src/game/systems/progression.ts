import type { Run, Item, Slot, Stats } from "../core/types";
import { cards, eligible } from "../data/cards";
import { classes } from "../data/world";
import { random, seedFor, clamp } from "../core/primitives";
export function derive(r: Run): Stats {
  const c = classes[r.classId],
    l = (id: number) => r.cards[id] || 0;
  const s: Stats = {
    maxHP: c.hp * (1 + l(1) * 0.1),
    armor: c.armor + l(2) * 8,
    basic: l(3) * 0.1,
    skill: l(4) * 0.1,
    global: l(14) * 0.08,
    elemental: l(12) * 0.18,
    attackRate: 0,
    skillCD: 0,
    speed: 0,
    projectile: 1 + l(7) * 0.1,
    range: 1 + l(13) * 0.1,
    crit: 0.15 * (1 + l(10) * 0.2),
    critMult: 1.5 + l(11) * 0.15,
    xp: 1 + l(8) * 0.08,
    lifesteal: 0,
    reduction: l(27) ? Math.min(0.5, 0.08 + (l(27) - 1) * 0.02) : 0,
  };
  let A =
      l(5) * 0.12 +
      (r.time < r.player.buffUntil ? 0.3 + Math.min(4, l(53) - 1) * 0.05 : 0),
    C = l(9) * 0.1,
    M = l(6) * 0.05 + (r.time < r.player.engineUntil ? 0.5 : 0);
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
            s.crit += 0.15 * aff.value;
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
  s.attackRate = c.rate * (1 + (4 * A) / (1 + A));
  s.skillCD = c.cd * (0.2 + 0.8 / (1 + C));
  s.speed = 200 * (1 + M / (1 + M));
  s.crit = clamp(s.crit, 0, 1);
  return s;
}
export function drawChoices(r: Run, fresh = true) {
  if (fresh) r.rerollUsed = false;
  const state = { rng: r.cardRng };
  const picked: number[] = [];
  for (let i = 0; i < 3; i++) {
    const pool = cards.filter((c) => eligible(r, c) && !picked.includes(c.id));
    const colors = ["藍", "紫", "青", "黃"];
    const base = r.elements.length ? [40, 25, 18, 12] : [29, 18, 40, 9];
    const weights = colors.map((color, j) =>
      pool.some((c) => c.rarity === color) ? base[j] : 0,
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
export function choose(r: Run, id: number) {
  if (r.phase !== "UPGRADE_CHOICE" || !r.choices.includes(id)) return false;
  const old = r.stats.maxHP;
  r.cards[id] = (r.cards[id] || 0) + 1;
  const el = ({ 15: "ice", 19: "fire", 24: "water", 28: "lightning" } as const)[
    id as 15
  ];
  if (el) r.elements.push(el);
  if (r.elements.includes("water") && r.elements.includes("fire"))
    r.fusion = "steam";
  if (r.elements.includes("water") && r.elements.includes("lightning"))
    r.fusion = "storm";
  if (r.elements.includes("ice") && r.elements.includes("fire"))
    r.fusion = "frostfire";
  r.stats = derive(r);
  r.player.hp = Math.min(
    r.stats.maxHP,
    r.player.hp + Math.max(0, r.stats.maxHP - old),
  );
  r.pendingLevels--;
  r.choices = [];
  if (r.pendingLevels > 0) drawChoices(r);
  else r.phase = "POST_CLEAR";
  return true;
}
export function itemFor(r: Run, enemyId: number, bossIndex = -1): Item | null {
  const state = {
    rng: seedFor(r.seed, r.room * 10000 + enemyId * 3 + bossIndex),
  };
  const enemy = r.enemies.find((e) => e.id === enemyId);
  if (bossIndex < 0 && random(state) > (enemy?.elite ? 0.3 : 0.04)) return null;
  const w = [60, 25, 10, 4, 1].map(
    (v, i) => v * (i > 0 ? 1 + r.modifiers.length * 0.25 : 1),
  );
  // S04 basic gear; orange/red abilities are explicitly scheduled for S10.
  let roll = random(state) * w.slice(0, 3).reduce((a, b) => a + b, 0),
    quality = 0;
  for (; quality < 2; quality++) {
    roll -= w[quality];
    if (roll < 0) break;
  }
  if (bossIndex === 0) quality = Math.max(1, quality);
  const slot = (["armor", "ring", "amulet"] as Slot[])[
    Math.floor(random(state) * 3)
  ];
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
  for (let i = 0; i <= quality; i++) {
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
      value: (lo + (hi - lo) * random(state)) * (1 + quality * 0.2),
    });
  }
  return {
    id: `${r.runId}-${r.room}-${enemyId}-${bossIndex}`,
    slot,
    rarity: ["藍", "紫", "黃"][quality],
    affixes,
    x: enemy?.x ?? 760,
    y: enemy?.y ?? 320,
  };
}
export function pickup(r: Run) {
  if (!["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r.phase)) return false;
  const sorted = [...r.items].sort(
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
  const item = r.bag[index],
    previous = r.equipment[item.slot];
  r.bag.splice(index, 1);
  if (previous) r.bag.push(previous);
  r.equipment[item.slot] = item;
  r.stats = derive(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP);
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
  r.stats = derive(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP);
  return true;
}
