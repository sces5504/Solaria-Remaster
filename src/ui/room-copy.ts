import type { Actor, Run } from "../game/core/types";
import { currentBiome } from "../game/data/biomes";
import { combatBosses } from "../game/data/combat-content";
import { eventDefinitions } from "../game/data/events";
import { zh } from "../i18n/zh-TW";

const eventStories = {
  christmas: "冰鈴穿過雪夜。禮盒與雪怪之後，霜鈴老人將現身。",
  bloodmoon: "赤月照亮血徒與飛蝠。留意狂化的精英，逐波守住暮光。",
  halloween: "墓園鬼火甦醒。幽魂與南瓜之後，災主將打破寂夜。",
  alien: "天外稜光落地。射手、飛碟與登陸機甲依序逼近。",
  meteor: "星塵化成獸群。先看落星的預告，離開鎖定之地。",
  army: "軍旗升起。刀兵、弓手與咒術師分波進攻，最後摧毀旗手。",
};
export function roomTitle(r: Run) {
  if (r.event) return eventDefinitions[r.event.id].name;
  if (r.room === 31) return "索拉里斯神";
  if (r.room % 5 === 0)
    return combatBosses[r.boss]?.name ?? zh.bosses[r.boss as 1];
  return currentBiome(r).themes[r.templates[(r.room - 1) % 5]];
}
export function roomStory(r: Run) {
  if (r.event) return eventStories[r.event.id];
  if (r.room === 31)
    return "日輪之下，三重力量仍在沉眠。擊破四柱，循著封印的缺口尋回日光。";
  if (r.room % 5 === 0) return "領主已在等你。留意預警，善用掩體。";
  return r.modifiers.length
    ? r.modifiers.map((m) => zh.modifiers[m]).join("<br>")
    : "前路尚有暮色，光仍在你的手中。";
}
export function bossStatus(r: Run, b: Actor) {
  const current = b.solarisBar ?? b.phase;
  const label =
    r.room === 31
      ? "索拉里斯神"
      : (combatBosses[b.bossId ?? r.boss]?.name ?? zh.bosses[r.boss as 1]);
  const count = r.enemies.filter((e) => e.sealPillar && e.hp > 0).length;
  const phase = r.solaris?.sealed
    ? `封印四柱 · 剩餘 ${count}`
    : b.transition > r.time
      ? "力量覺醒・暫時無敵"
      : `第 ${current} 階段`;
  let bar = "";
  if (b.solarisBar)
    bar = `<div class="sun-health" aria-label="索拉里斯三段生命">${[1, 2, 3].map((n) => `<span class="${current === n ? "active" : ""}" title="日輪 ${n}"><i style="width:${n < current ? 0 : n > current ? 100 : Math.max(0, (b.hp / b.maxHP) * 100)}%"></i></span>`).join("")}</div>`;
  else {
    const group = b.splitGroup
      ? r.enemies.filter((e) => e.splitGroup === b.splitGroup)
      : [b];
    const hp = group.reduce((s, e) => s + e.hp, 0),
      max = b.splitGroup ? b.maxHP * 2 : b.maxHP;
    bar = `<div><i style="width:${Math.max(0, (hp / max) * 100)}%"></i></div>`;
  }
  return `<div class="boss"><span>${label} · ${phase}</span>${bar}</div>`;
}
