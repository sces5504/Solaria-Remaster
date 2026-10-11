import type { Run, Item, ClassId } from "../game/core/types";
import { cards } from "../game/data/cards";
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
  return `<span class="rarity ${item.rarity}">${item.rarity} · ${zh.slots[item.slot]}</span><br>${item.affixes.map((a) => `${escape(zh.affixes[a.stat as keyof typeof zh.affixes])} +${["hp", "armor"].includes(a.stat) ? a.value.toFixed(1) : a.stat === "critMult" ? a.value.toFixed(2) : (a.value * 100).toFixed(1) + "%"}`).join("<br>")}`;
}
export function hud(r: Run) {
  const p = r.player,
    boss = r.enemies.find((e) => e.kind > 5),
    shield = p.shields.reduce((n, s) => n + s.amount, 0);
  return `<div class="status"><strong>${zh.classes[r.classId]} <span class="muted">Lv.${r.level}</span></strong><div class="hp"><i style="width:${(p.hp / r.stats.maxHP) * 100}%"></i><span>${Math.ceil(p.hp)} / ${Math.ceil(r.stats.maxHP)}${shield > 0 ? " · 盾 " + Math.ceil(shield) : ""}</span></div><small>XP ${Math.floor(r.xp)} / ${100 + 20 * (r.level - 1)}</small></div><div class="room"><strong>暮光草原</strong><small>第 ${r.room} / 5 房 · 第一里程碑</small>${boss ? `<div class="boss"><span>${zh.bosses[r.boss as 1]} · ${boss.transition > r.time ? "轉場無敵" : boss.phase + " 階段"}</span><div><i style="width:${(boss.hp / boss.maxHP) * 100}%"></i></div></div>` : ""}</div><div class="elements"><span>${r.elements.length ? r.elements.map((e) => zh.elements[e]).join(" · ") : "尚未覺醒"}</span><small>${r.fusion ? zh.fusion[r.fusion] : ""}</small><small>${r.modifiers.map((m) => zh.modifiers[m]).join(" / ")}</small><small>${r.phase === "POST_CLEAR" ? "已清關 · F 撿装 / I 裝備 / 走入右門" : ""}</small></div>`;
}
export function menu(saved: boolean) {
  return `<div class="menu"><div class="eyebrow">日蝕之後 · 第一里程碑</div><h1>SOLARIA</h1><p class="tagline">在暮色之中，尋回日光。</p><div class="menu-actions">${button("開始新局", "new")}${button("繼續旅程", "continue", saved ? "" : 'disabled title="尚無存檔"')}${button("操作與製作資訊", "controls")}${button("卡片圖鑑 · 59", "catalog")}${button("匯入存檔", "import")}</div><div class="fine">三職業 · 四普通房 · 兩隻草原 Boss<br>製作者：Mori Fang</div></div>`;
}
export function classSelect() {
  const desc: Record<ClassId, string> = {
    sword: "150 生命 / 25 甲<br>扇形斬擊 · 全方向格擋後反擊",
    bow: "100 生命 / 10 甲<br>精準箭矢 · 一秒五箭快射",
    mage: "90 生命 / 5 甲<br>星火彈 · 指定位置行星爆",
  };
  return `<section class="panel wide"><div class="eyebrow">選擇你的旅人</div><h2>踏入暮光草原</h2><div class="cards">${(["sword", "bow", "mage"] as ClassId[]).map((id, i) => `<button class="class-card" data-action="class:${id}"><img src="${import.meta.env.BASE_URL}assets/solaria-atlas.png" alt="" style="object-position:${i * 48}px 0"><span class="crest">${["⚔", "➶", "✦"][i]}</span><h3>${zh.classes[id]}</h3><span class="gold">${zh.titles[id]}</span><p>${desc[id]}</p></button>`).join("")}</div>${button("返回主選單", "menu")}</section>`;
}
export function choiceView(r: Run, selected: number) {
  return `<section class="panel wide"><div class="eyebrow">世界暫停 · 升級 ${r.level - r.pendingLevels + 1}</div><h2>選擇一份力量</h2><p>${r.pendingLevels > 1 ? "還有 " + r.pendingLevels + " 次選擇" : "每次選擇都將自動保存"} · ${r.elements.map((e) => zh.elements[e]).join(" / ") || "元素名額 0 / 2"}</p><div class="cards">${r.choices
    .map((id, index) => {
      const c = cards.find((c) => c.id === id)!;
      const l = r.cards[id] || 0;
      return `<button class="card ${c.rarity} ${selected === index ? "selected" : ""}" data-action="choose:${id}"><span class="rarity">${c.rarity} · ${id <= 14 ? "數值" : id <= 40 ? "元素" : "職業"}</span><h3>${c.name}</h3><span class="gold">${id <= 14 ? "本局已取 " + l + " 次" : l ? "Lv." + l + " → " + (l + 1) : "解鎖 Lv.1"}</span><p>${c.description}</p>${l && id > 14 ? "<small>升級依規格增加傷害與機制（機制上限 Lv.5）</small>" : ""}</button>`;
    })
    .join(
      "",
    )}</div><small>左右鍵選擇 · Enter 確認 · 滑鼠點擊</small><details><summary>目前構築</summary>${
    Object.entries(r.cards)
      .map(([id, l]) => `${cards.find((c) => c.id === Number(id))!.name} ${l}`)
      .join(" · ") || "尚未取得卡片"
  }</details></section>`;
}
export function inventory(r: Run) {
  return `<section class="panel wide"><div class="eyebrow">清關整備 · 世界暫停</div><h2>裝備與背包</h2><div class="equipment">${(["armor", "ring", "amulet"] as const).map((slot) => `<div class="item"><strong>${zh.slots[slot]}</strong><p>${r.equipment[slot] ? itemView(r.equipment[slot]!) : "空欄"}</p>${r.equipment[slot] ? button("卸下至地面", `discard:${escape(r.equipment[slot]!.id)}`) : ""}</div>`).join("")}</div><h3>背包 ${r.bag.length} / 12</h3><div class="bag">${Array.from({ length: 12 }, (_, i) => (r.bag[i] ? `<div class="item">${itemView(r.bag[i])}<div>${button("穿戴", `equip:${escape(r.bag[i].id)}`)}${button("丟棄", `discard:${escape(r.bag[i].id)}`)}</div></div>` : '<div class="item empty">空格</div>')).join("")}</div><p>地面剩餘 ${r.items.length} 件。關閉後靠近物品按 F；滿包時留在地上。</p>${button("返回戰場", "resume")}${button("匯出存檔", "export")}</section>`;
}
export function stats(r: Run) {
  return `<section class="panel"><div class="eyebrow">構築資訊 · 世界暫停</div><h2>${zh.titles[r.classId]}</h2><p>攻速 ${r.stats.attackRate.toFixed(2)} 次 / 秒<br>職技 CD ${r.stats.skillCD.toFixed(2)} 秒<br>暴擊 ${(r.stats.crit * 100).toFixed(1)}% × ${r.stats.critMult.toFixed(2)}<br>移速 ${r.stats.speed.toFixed(1)} · 護甲 ${r.stats.armor.toFixed(1)}</p><div class="owned">${
    Object.entries(r.cards)
      .map(
        ([id, l]) =>
          `<span>${cards.find((c) => c.id === Number(id))!.name} Lv.${l}</span>`,
      )
      .join("") || "尚未取得卡片"
  }</div>${button("返回戰場", "resume")}</section>`;
}
export function controls() {
  return `<section class="panel"><h2>旅人手札</h2><p>${zh.controls}</p><p>閃避沒有無敵。格擋需在攻擊抵達前施放。樹木與岩石可阻擋敵我彈道；湖泊可跨越，但需要合法落點。</p><p>每局四間不重複草原房，再挑戰隨機狼王或邪惡山羊王。清關回復生命，累積經驗後三選一，走入右門前可整備裝備。</p><p>戰鬥重載回入口；選卡與清關裝備操作自動保存。存檔在此瀏覽器，可匯出備份。</p><p>製作者：Mori Fang<br>原創像素素材與合成音效。桌面鍵盤滑鼠先行。</p>${button("返回", "back")}</section>`;
}
export function catalog() {
  return `<section class="panel wide"><h2>里程碑卡片圖鑑 · 59</h2><div class="catalog">${cards.map((c) => `<article><span class="rarity ${c.rarity}">#${c.id} ${c.rarity}</span><strong>${c.name}</strong><p>${c.description}</p></article>`).join("")}</div>${button("返回", "back")}</section>`;
}
