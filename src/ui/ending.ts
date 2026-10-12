import type { Run } from "../game/core/types";
import { zh } from "../i18n/zh-TW";
import { button } from "./view";
export type EndingPhase = "cinematic" | "credits" | "done";
export function endingView(run: Run, phase: EndingPhase, age: number) {
  if (phase === "done")
    return `<section class="panel"><div class="eyebrow">日光重臨 · 第 ${run.loop ?? 1} 周目</div><h2>旅人，謝謝你</h2><p>${zh.classes[run.classId]} · Lv.${run.level}<br>${Math.floor(run.time / 60)} 分 ${Math.floor(run.time % 60)} 秒 · 擊敗索拉里斯神</p><p>製作者：Mori Fang</p><p class="fine">下一周目保留本局構築，秘境將重新展開。</p>${button("下一周目", "nextLoop")}${button("完成本局", "finish")}${button("匯出構築", "export")}</section>`;
  return `<section class="ending ${phase}" aria-label="日光重臨破關動畫" style="--ending-age:-${Math.max(0, age)}s"><div class="ending-night"></div><div class="ending-eclipse"></div><div class="ending-rays"></div>${phase === "cinematic" ? `<div class="ending-caption"><p class="ending-line line-one">索拉里斯神的力量，終於歸於寂靜。</p><p class="ending-line line-two">暮色退去，日光再次照亮旅途。</p><p class="ending-line line-three">你走過的每一處，都迎來了黎明。</p></div>` : `<div class="credits-window" aria-label="感謝遊玩字幕"><div class="credits-roll"><p class="eyebrow">日光重臨</p><h2>感謝遊玩</h2><p>SOLARIA REMASTER</p><p>獻給每一位走過暮色的旅人</p><p class="credit-label">製作者</p><p>Mori Fang</p><p class="credit-label">你的旅程</p><p>${zh.classes[run.classId]} · Lv.${run.level}</p><p>第 ${run.loop ?? 1} 周目 · 擊敗索拉里斯神</p><p>願下一次啟程，仍有光與你同行。</p><h2>旅人，謝謝你。</h2></div></div>`}<div class="ending-controls">${button("略過動畫與字幕", "skipEnding")}</div></section>`;
}
