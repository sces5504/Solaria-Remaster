import {
  achievements,
  cosmetics,
  type Profile,
} from "../game/persistence/profile";
import { escape, button } from "./view";
import { zh } from "../i18n/zh-TW";
import type { JourneyRecord } from "../game/persistence/records";
export function journal(p: Profile, records: JourneyRecord[]) {
  return `<section class="panel wide journal"><div class="eyebrow">星典與旅人</div><h2>旅程紀錄</h2><p class="fine">收藏與外觀留在星典。每次新旅程都從同樣的力量開始。</p><div class="achievement-grid">${Object.entries(
    achievements,
  )
    .map(
      ([id, a]) =>
        `<article class="achievement ${p.achievements.includes(id as keyof typeof achievements) ? "unlocked" : "locked"}"><span aria-hidden="true">${p.achievements.includes(id as keyof typeof achievements) ? "✦" : "◇"}</span><div><h3>${a.name}</h3><p>${a.description}</p><small>${p.achievements.includes(id as keyof typeof achievements) ? "已達成" : "尚待旅人留下足跡"}</small></div></article>`,
    )
    .join(
      "",
    )}</div><h3>旅人光色</h3><div class="cosmetic-options">${Object.entries(
    cosmetics,
  )
    .map(([id, c]) =>
      button(
        `${p.cosmetic === id ? "✓ " : ""}${c.name}`,
        `cosmetic:${id}`,
        `${c.requirement && !p.achievements.includes(c.requirement) ? "disabled" : ""} style="--skin-color:#${c.color.toString(16)}"`,
      ),
    )
    .join(
      "",
    )}</div><details><summary>最近旅程 · ${records.length} 筆</summary><div class="records">${
    records
      .slice()
      .reverse()
      .map(
        (r) =>
          `<p><strong>${zh.classes[r.classId]}</strong> · ${r.finished ? "日光重臨" : "暮光收留"}${r.testing ? " · 試煉構築" : ""}<br><small>第 ${r.loop ?? 1} 周目 · ${r.room ? `第 ${r.room} 關 · ` : ""}Lv.${r.level} · ${Math.floor(r.time / 60)} 分 ${Math.floor(r.time % 60)} 秒 · 星印 ${escape(r.seed)}</small></p>`,
      )
      .join("") || "<p>尚無已結束的旅程。</p>"
  }</div></details>${button("匯出星典備份", "exportProfile")}${button("返回", "back")}</section>`;
}
export function tutorial() {
  return `<section class="panel wide tutorial"><div class="eyebrow">旅人手冊</div><h2>循光而行</h2><div class="tutorial-steps"><article><b>01 · 走位與瞄準</b><p>WASD 移動，滑鼠瞄準。掩體能擋住敵彈；紅色輪廓是敵人的預警。</p></article><article><b>02 · 兩種力量</b><p>按住左鍵普攻，右鍵施放職技；兩者可同時使用。空白鍵閃避，角色腳下顯示職技冷卻。</p></article><article><b>03 · 清關與拾取</b><p>靠近裝備按 E 拾取。清關先回復生命，再吸收經驗與補給、選擇力量；裝備留在地面。I 整理背包、C 看構築。</p></article><article><b>04 · 尋回日光</b><p>靠近右門按 E 前進。三十關秘境之後，索拉里斯等待你；災厄替換普通房，清完獲得專屬紅裝。</p></article></div><p class="fine">Esc 暫停；切換分頁會自動暫停，返回後需手動繼續。每次三選一可刷新一次；重載保留已使用狀態。</p>${button("回到旅程", "back")}</section>`;
}
