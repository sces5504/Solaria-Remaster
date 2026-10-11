import type { Actor, DamageContext, Run } from "../core/types";
import { angle, distance } from "../core/primitives";
import { context, cone, hit, shield, shoot, visual } from "./combat";
import { isBossRoom } from "../data/journey";
import { recoverHP } from "./ability-policies";
export function originalBasicAbilities(r: Run, aim: number) {
  r.player.originalBasics = (r.player.originalBasics ?? 0) + 1;
  if (r.cards[70] && r.player.originalBasics % 5 === 0) {
    cone(
      r,
      r.player,
      aim,
      110,
      Math.PI * 0.8,
      80,
      context(r, 70, "additional", [], false, 1, false, "none"),
    );
    visual(r, "ghost", r.player, 0, 0xc2bcff, 110 * r.stats.range, aim, {
      duration: 0.5,
    });
  }
}
export function bossEntryAbility(r: Run) {
  if (!r.cards[76] || !isBossRoom(r)) return;
  const key = `${r.loop ?? 1}-${r.room}`;
  if (r.relicEntryKey === key) return;
  r.relicEntryKey = key;
  shield(r, r.stats.maxHP * 0.25, 5);
  visual(r, "relic", r.player, 0, 0xffdf9b, 48, 0, { duration: 0.7 });
}
export function rootKillAbilities(r: Run, e: Actor) {
  if (!e.killedByRoot || !r.cards[75] || (r.cooldowns[75] ?? 0) > r.time)
    return;
  r.cooldowns[75] = r.time + 1;
  const targets = r.enemies
    .filter((target) => target.hp > 0 && !target.sealPillar)
    .sort((a, b) => distance(e, a) - distance(e, b));
  if (!targets.length) return;
  for (let i = 0; i < 3; i++) {
    const target = targets[i % targets.length];
    shoot(
      r,
      e,
      angle(e, target) + (i - 1) * 0.2,
      40,
      380,
      800,
      context(r, 75, "additional", [], false, 1, false, "none"),
    );
    r.projectiles.at(-1)!.homingTarget = target.id;
  }
}
export function skillOpeningBonus(r: Run, e: Actor, ctx: DamageContext) {
  if (
    !r.cards[77] ||
    e.kind <= 5 ||
    ctx.damageKind !== "skill" ||
    ctx.procPolicy !== "root"
  )
    return 1;
  const key = `${r.loop ?? 1}-${r.room}-${e.splitGroup ?? e.id}-${e.solarisBar ?? e.phase}`;
  r.focusedPhases ??= [];
  if (r.focusedPhases.includes(key)) return 1;
  r.focusedPhases.push(key);
  visual(r, "relic", e, 0, 0xffebaa, 65, 0, { duration: 0.5 });
  return 2;
}
export function elementResonance(
  r: Run,
  e: Actor,
  ctx: DamageContext,
  actual: number,
) {
  if (
    !r.cards[74] ||
    actual <= 0 ||
    e.hp <= 0 ||
    !ctx.elementMask.length ||
    ctx.procPolicy !== "root" ||
    (e.advancedResonanceNext ?? 0) > r.time
  )
    return;
  e.advancedResonanceNext = r.time + 1;
  hit(
    r,
    e,
    40,
    context(r, 74, "additional", [], false, ctx.chainScale, false, "none"),
  );
  visual(r, "resonance", e, 0, 0xf3ddab, 42, 0, {
    duration: 0.4,
    elements: r.elements,
  });
}
export function lifesteal(r: Run, actual: number, ctx: DamageContext) {
  if (
    !ctx.lifestealEligible ||
    actual <= 0 ||
    ctx.damageKind === "dot" ||
    ctx.damageKind === "percent"
  )
    return;
  const ordinary = Math.max(0, r.stats.lifesteal - (r.cards[79] ? 0.06 : 0));
  recoverHP(r, actual * ordinary);
  if (!r.cards[79]) return;
  r.vampireRecent = (r.vampireRecent ?? []).filter(
    (entry) => r.time - entry.time < 1,
  );
  const budget = Math.max(
    0,
    r.stats.maxHP * 0.2 -
      r.vampireRecent.reduce((sum, entry) => sum + entry.amount, 0),
  );
  const gain = recoverHP(r, Math.min(actual * 0.06, budget));
  if (gain > 0) r.vampireRecent.push({ time: r.time, amount: gain });
}
