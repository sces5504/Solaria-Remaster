import type { Run, Item, ClassId } from "../game/core/types";
import { classes } from "../game/data/world";
import { cards } from "../game/data/cards";
import { cardCopy } from "../i18n/card-copy";
import { cardArt } from "./card-art";
import { zh } from "../i18n/zh-TW";
export const escape = (v: unknown) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const button = (label: string, action: string, extra = "") =>
  `<button data-action="${action}" ${extra}>${label}</button>`;
export function itemView(item: Item) {
  return `<span class="rarity ${item.rarity}">${zh.slots[item.slot]}</span><br>${item.affixes.map((a) => `${escape(zh.affixes[a.stat as keyof typeof zh.affixes])} +${["hp", "armor"].includes(a.stat) ? a.value.toFixed(1) : a.stat === "critMult" ? a.value.toFixed(2) : (a.value * 100).toFixed(1) + "%"}`).join("<br>")}`;
}
export function hud(r: Run) {
  const p = r.player,
    boss = r.enemies.find((e) => e.kind > 5),
    shield = p.shields.reduce((n, s) => n + s.amount, 0),
    xpNeed = 100 + 20 * (r.level - 1);
  return `<div class="status"><strong>${zh.classes[r.classId]} <span class="muted">Lv.${r.level}</span></strong><div class="hp"><i style="width:${Math.max(0, (p.hp / r.stats.maxHP) * 100)}%"></i><span>${Math.ceil(p.hp)} / ${Math.ceil(r.stats.maxHP)}${shield > 0 ? " · 護盾 " + Math.ceil(shield) : ""}</span></div><div class="xp-track"><i style="width:${Math.min(100, (r.xp / xpNeed) * 100)}%"></i></div><small>經驗 ${Math.floor(r.xp)} / ${xpNeed}</small></div><div class="room"><strong>暮光草原</strong><small>第 ${r.room} / 5 關 · ${r.room === 5 ? "領主之境" : zh.templates[r.templates[r.room - 1]]}</small>${boss ? `<div class="boss"><span>${zh.bosses[r.boss as 1]} · ${boss.transition > r.time ? "力量覺醒・暫時無敵" : "第 " + boss.phase + " 階段"}</span><div><i style="width:${(boss.hp / boss.maxHP) * 100}%"></i></div></div>` : ""}</div><div class="score"><small>本局分數</small><strong>${(r.score || 0).toLocaleString()}</strong><small>${r.phase === "POST_CLEAR" ? "已清關 · E 拾取／進門" : r.phase === "SETTLEMENT" ? "清算 · 經驗與補給集結中" : `敵人 ${r.enemies.filter((e) => e.hp > 0).length} · 後續 ${r.reserves?.length || 0}`}</small></div>`;
}
export function sidebarIntro() {
  return `<div class="side-title">旅人手札</div><h2>日光邊境</h2><p>四片草原，一位領主。<br>以選卡塑造你的戰鬥風格。</p><div class="side-divider"></div><p>WASD 移動<br>左鍵持續普攻<br>右鍵職業技能<br>空白閃避<br>E 拾取／進門</p><p class="side-note">看清蓄力方向，再橫向閃避。<br>掩體能阻擋敵我彈道。</p>`;
}
export function sidebar(r: Run) {
  const row = (name: string, value: string) =>
    `<div class="stat-row"><span>${name}</span><strong>${value}</strong></div>`;
  return `<div class="side-title">你的旅人</div><h2>${zh.classes[r.classId]}</h2><small>${zh.titles[r.classId]}</small><section><h3>戰鬥屬性</h3>${row("普攻基準", (classes[r.classId].damage * (1 + r.stats.basic + r.stats.global)).toFixed(1))}${row("攻擊頻率", r.stats.attackRate.toFixed(2) + " / 秒")}${row("職技冷卻", r.stats.skillCD.toFixed(1) + " 秒")}${row("護甲", r.stats.armor.toFixed(0))}${row("暴擊率", (r.stats.crit * 100).toFixed(1) + "%")}${row("暴擊倍率", r.stats.critMult.toFixed(2) + " 倍")}${row("移動速度", r.stats.speed.toFixed(0))}</section><section><h3>元素之力</h3><div class="element-chips">${r.elements.map((e) => `<span class="element-${e}">${zh.elements[e]}</span>`).join("") || "<small>尚未覺醒元素</small>"}</div>${r.fusion ? `<p class="fusion">${zh.fusion[r.fusion]}</p>` : ""}</section><section><h3>目前裝備 <span>I</span></h3>${(
    ["armor", "ring", "amulet"] as const
  )
    .map((slot) => {
      const i = r.equipment[slot];
      return `<div class="equipment-mini ${i?.rarity || ""}"><strong>${zh.slots[slot]}</strong><small>${i ? i.affixes.map((a) => zh.affixes[a.stat as keyof typeof zh.affixes]).join(" · ") : "尚未穿戴"}</small></div>`;
    })
    .join(
      "",
    )}</section><p class="side-note">${zh.skills[r.classId]} · ${r.player.skillReady <= r.time ? "已就緒" : "冷卻 " + Math.max(0, r.player.skillReady - r.time).toFixed(1) + " 秒"}<br>擊殺 ${r.kills || 0} · ${Math.floor(r.time / 60)}:${String(Math.floor(r.time % 60)).padStart(2, "0")}<br>C 查看卡片構築 · Esc 暫停</p>`;
}
export function menu(saved: boolean) {
  return `<div class="menu"><div class="eyebrow">日蝕之後 · 旅途初章</div><h1>SOLARIA</h1><p class="tagline">在暮色之中，尋回日光。</p><div class="menu-actions">${button("開始新局", "new")}${button("繼續旅程", "continue", saved ? "" : 'disabled title="尚無存檔"')}${button("操作與製作資訊", "controls")}${button("卡片圖鑑 · 59", "catalog")}${button("匯入存檔", "import")}</div><div class="fine">三職業 · 四普通房 · 兩隻草原 Boss<br>製作者：Mori Fang</div></div>`;
}
export function classSelect() {
  const desc: Record<ClassId, string> = {
    sword: "150 生命 / 25 甲<br>扇形斬擊 · 全方向格擋 · 成功後反擊",
    bow: "100 生命 / 10 甲<br>精準箭矢 · 一秒五箭快射",
    mage: "90 生命 / 5 甲<br>星火彈 · 指定位置行星爆",
  };
  return `<section class="panel wide"><div class="eyebrow">選擇你的旅人</div><h2>踏入暮光草原</h2><div class="cards">${(["sword", "bow", "mage"] as ClassId[]).map((id) => `<button class="class-card" data-action="class:${id}"><img src="${import.meta.env.BASE_URL}assets/${id}.png" alt="${zh.classes[id]}"><h3>${zh.classes[id]}</h3><span class="gold">${zh.titles[id]}</span><p>${desc[id]}</p></button>`).join("")}</div>${button("返回主選單", "menu")}</section>`;
}
export function choiceView(r: Run, selected: number) {
  return `<section class="panel wide"><div class="eyebrow">世界暫停 · 升級 ${r.level - r.pendingLevels + 1}</div><h2>選擇一份力量</h2><p>${r.pendingLevels > 1 ? "還有 " + r.pendingLevels + " 次選擇" : "循光而行，選擇你的共鳴"} · ${r.elements.map((e) => zh.elements[e]).join(" / ") || "元素名額 0 / 2"}</p><div class="cards">${r.choices
    .map((id, index) => {
      const c = cards.find((c) => c.id === id)!;
      const l = r.cards[id] || 0;
      return `<button class="card ${c.rarity} ${selected === index ? "selected" : ""}" data-action="choose:${id}">${cardArt(id)}<span class="rarity">${id <= 14 ? "旅人強化" : id <= 40 ? "元素能力" : "職業技藝"}</span><h3>${c.name}</h3><span class="gold">${id <= 14 ? "本局已取 " + l + " 次" : l ? "Lv." + l + " → " + (l + 1) : "解鎖 Lv.1"}</span><p>${cardCopy[c.id] || c.description}</p>${l && id > 14 ? "<small>再次取得可強化此能力，招式變化最高至 Lv.5</small>" : ""}</button>`;
    })
    .join(
      "",
    )}</div><div class="choice-footer">${button(r.rerollUsed ? "本次已刷新" : "刷新 · 1 次", "reroll", r.rerollUsed ? "disabled" : "")}<small>每次覺醒可刷新一次</small></div><small>左右鍵選擇 · Enter 確認 · 滑鼠點擊</small><details><summary>目前構築</summary>${
    Object.entries(r.cards)
      .map(([id, l]) => `${cards.find((c) => c.id === Number(id))!.name} ${l}`)
      .join(" · ") || "等待第一縷共鳴"
  }</details></section>`;
}
export function inventory(r: Run) {
  return `<section class="panel wide"><div class="eyebrow">清關整備 · 世界暫停</div><h2>裝備與背包</h2><div class="equipment">${(["armor", "ring", "amulet"] as const).map((slot) => `<div class="item"><strong>${zh.slots[slot]}</strong><p>${r.equipment[slot] ? itemView(r.equipment[slot]!) : "空欄"}</p>${r.equipment[slot] ? button("卸下至地面", `discard:${escape(r.equipment[slot]!.id)}`) : ""}</div>`).join("")}</div><h3>背包 ${r.bag.length} / 12</h3><div class="bag">${Array.from({ length: 12 }, (_, i) => (r.bag[i] ? `<div class="item">${itemView(r.bag[i])}<div>${button("穿戴", `equip:${escape(r.bag[i].id)}`)}${button("丟棄", `discard:${escape(r.bag[i].id)}`)}</div></div>` : '<div class="item empty">空格</div>')).join("")}</div><p>地面剩餘 ${r.items.length} 件。關閉後靠近物品按 E；滿包時留在地上。</p>${button("返回戰場", "resume")}${button("匯出存檔", "export")}</section>`;
}
export function stats(r: Run) {
  return `<section class="panel"><div class="eyebrow">構築資訊 · 世界暫停</div><h2>${zh.titles[r.classId]}</h2><p>攻速 ${r.stats.attackRate.toFixed(2)} 次 / 秒<br>職技 CD ${r.stats.skillCD.toFixed(2)} 秒<br>暴擊 ${(r.stats.crit * 100).toFixed(1)}% × ${r.stats.critMult.toFixed(2)}<br>移速 ${r.stats.speed.toFixed(1)} · 護甲 ${r.stats.armor.toFixed(1)}</p><div class="owned">${
    Object.entries(r.cards)
      .map(
        ([id, l]) =>
          `<span>${cards.find((c) => c.id === Number(id))!.name} Lv.${l}</span>`,
      )
      .join("") || "等待第一縷共鳴"
  }</div>${button("返回戰場", "resume")}</section>`;
}
export function controls() {
  return `<section class="panel"><h2>旅人手札</h2><p>${zh.controls}</p><p>閃避沒有無敵。格擋需在攻擊抵達前施放。樹木與岩石可阻擋敵我彈道；湖泊可跨越，但需要合法落點。</p><p>每局四間不重複草原房，再挑戰隨機狼王或邪惡山羊王。清關回復生命，累積經驗後三選一，按 E 進門前可整備裝備。</p><p>戰鬥重載回入口；選卡與清關裝備操作自動保存。存檔在此瀏覽器，可匯出備份。</p><p>製作者：Mori Fang<br>日蝕之後，每一次啟程，都是新的可能。</p>${button("返回", "back")}</section>`;
}
export function catalog(discovered: number[] = []) {
  const known = new Set(discovered);
  return `<section class="panel wide catalog-panel"><div class="eyebrow">旅人圖鑑 · ${known.size} / 59</div><h2>光的記憶</h2><p>親手取得的力量，會留在這裡。</p><div class="catalog">${cards.map((c) => (known.has(c.id) ? `<article class="catalog-card ${c.rarity}" data-card="${c.id}">${cardArt(c.id)}<span class="rarity ${c.rarity}">#${String(c.id).padStart(2, "0")}</span><strong>${c.name}</strong><p>${cardCopy[c.id] || c.description}</p></article>` : `<article class="catalog-card locked" data-card="${c.id}">${cardArt(c.id, true)}<span class="rarity">#${String(c.id).padStart(2, "0")}</span><strong>未曾相遇</strong><p>於旅途中取得後揭曉</p></article>`)).join("")}</div>${button("返回", "back")}</section>`;
}
export function pauseView(r: Run) {
  return `<section class="panel pause-panel"><div class="eyebrow">暮色之間</div><div class="pause-emblem" aria-hidden="true">✧</div><h2>日光，等你歸來</h2><p class="pause-story">風停在樹梢，旅途仍在。<br>稍作歇息，再循光而行。</p><div class="pause-record"><div><small>你的旅人</small><strong>${zh.classes[r.classId]} · Lv.${r.level}</strong></div><div><small>暮光草原</small><strong>第 ${r.room} / 5 關</strong></div><div><small>旅程分數</small><strong>${(r.score || 0).toLocaleString()}</strong></div></div><div class="pause-actions">${button("繼續旅程", "resume", 'class="primary"')}${button("旅人手札", "controls")}${button("光的記憶", "catalog")}${button("匯出存檔", "export")}${button("回主選單", "returnMenu")}</div><p class="fine">Esc 返回旅途 · 戰鬥重載回本房入口</p></section>`;
}

export function worldHints(r: Run) {
  if (["ROOM_INTRO", "UPGRADE_CHOICE", "DEAD", "RUN_END"].includes(r.phase))
    return "";
  const label = (x: number, y: number, text: string, classes: string) =>
    `<span class="world-label ${classes}" style="left:${(x / 1024) * 100}%;top:${(y / 640) * 100}%">${text}</span>`;
  const nearDoor =
    r.phase === "POST_CLEAR" &&
    r.player.x > 872 &&
    Math.abs(r.player.y - 320) < 55;
  let html = r.items
    .map((item) => {
      const close = Math.hypot(item.x - r.player.x, item.y - r.player.y) <= 64;
      return label(
        item.x,
        item.y + 24,
        (["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r.phase) &&
        close &&
        !nearDoor
          ? "<kbd>E</kbd> 檢取 · "
          : "") + escape(zh.slots[item.slot]),
        "item-label " + item.rarity + (close ? " nearby" : ""),
      );
    })
    .join("");
  if (r.phase === "POST_CLEAR") {
    const near = nearDoor;
    html += label(
      928,
      270,
      near ? "<kbd>E</kbd> 進入" : "出口 · 靠近按 E",
      "door-label" + (near ? " nearby" : ""),
    );
  }
  if (r.phase === "SETTLEMENT")
    html += '<div class="settlement-note">清算中 · 收集經驗與補給</div>';
  return html;
}

export function testing(r: Run, query = "") {
  return `<section class="panel wide test-panel"><div class="eyebrow">旅人試驗場 · 世界暫停</div><h2>測試構築</h2><p>直接給予已實作的卡片，不消耗升級選擇。職業卡切換職業並替換職業卡；元素自動覺醒，超過兩種時替換元素構築。</p><label class="test-search">尋找力量 <input id="test-search" type="search" value="${escape(query)}" placeholder="卡名、能力或編號" aria-label="搜尋測試卡片"></label><div class="test-summary">${zh.classes[r.classId]} · ${r.elements.map((e) => zh.elements[e]).join("／") || "尚未覺醒"} · 職技 ${r.stats.skillCD.toFixed(1)} 秒</div><div class="test-cards">${cards
    .map((c) => {
      const l = r.cards[c.id] || 0,
        max = c.id <= 14 ? Infinity : [15, 19, 24, 28].includes(c.id) ? 1 : 5;
      return `<article class="test-card ${c.rarity}" ${`${c.id} ${c.name} ${cardCopy[c.id] || c.description}`.toLowerCase().includes(query.trim().toLowerCase()) ? "" : "hidden"} data-search="${escape(`${c.id} ${c.name} ${cardCopy[c.id] || c.description}`)}">${cardArt(c.id)}<div><strong>#${c.id} ${c.name}</strong><p>${cardCopy[c.id] || c.description}</p><small>目前 ${l ? "Lv." + l : "未取得"}${c.classId ? " · " + zh.classes[c.classId] : ""}</small></div>${button(l >= max ? "已滿級" : "給予 +1", `grant:${c.id}`, l >= max ? "disabled" : "")}</article>`;
    })
    .join("")}</div>${button("返回", "testBack")}</section>`;
}
