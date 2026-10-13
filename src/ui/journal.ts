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
export function tutorial(beforeClass = false) {
  return `<section class="panel wide tutorial"><div class="eyebrow">旅人手冊</div><h2>循光而行</h2><div class="tutorial-steps"><article><b>01 · 迎戰暮色</b><p>WASD 移動、滑鼠瞄準。左鍵普攻與右鍵職技，兩者可同時使用。空白鍵閃避沒有無敵；劍士可用格擋抵禦攻擊。留意敵方預警，善用掩體。</p></article><article><b>02 · 元素覺醒</b><p>覺醒是構築的核心：通常最多覺醒兩種元素，沿各自能力成長，特定組合可融合為新力量。特殊命運牌可突破上限，但伴隨代價。每次升級三選一，可免費刷新一次。</p></article><article><b>03 · 清關與整備</b><p>每關皆有升級收穫。靠近裝備按 E 拾取；清關後可穿戴整備，再於右門按 E 前進。I 開背包、C 看構築。六重秘境之後，迎戰索拉里斯神。</p></article><article><b>04 · 留住旅程</b><p>Esc 暫停；切換分頁會自動暫停。戰鬥重載回本房入口，選卡與清關整備自動保存。存檔保存在此瀏覽器，可從暫停選單匯出備份。</p></article></div><p class="fine">製作者：Mori Fang · 日蝕之後，循光而行。</p>${button(beforeClass ? "選擇旅人" : "返回", "back")}</section>`;
}
