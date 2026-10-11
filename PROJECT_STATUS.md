# PROJECT_STATUS — 第一里程碑試玩修正版

更新：2026-10-11。起點 `6399276`（`docs/solaria-cloud-spec`），實作分支 `implement/s00-s05`；原版 `sces5504/Solaria` 僅唯讀參考（HEAD `4a07ca6`）。S06–S14 尚未開始。本次依使用者 16 項回饋改善 S00–S05，不以擴充完整 v1 取代修正第一版。

## 第一里程碑內容

三職業、草原五怪與六個模板，每局四個不重複普通房＋隨機狼王／邪惡山羊王。兩 Boss 各兩階段三招、交錯／2 秒轉場／掩體耐久；59 張卡、兩元素容量及三融合；藍紫黃裝備、三裝備欄／12 背包；IndexedDB 清算、選卡與裝備 checkpoint、匯出匯入與 revision 衝突保護。PixiJS 8.22.0 WebGL，1024×640、獨立 60Hz 核心。製作者：Mori Fang。

## 本次 16 項修正

1. 滑鼠改用 mousedown／mouseup 接收每個按鍵：左鍵已按住時的右鍵不會被 Pointer Events 的多鍵語意漏掉。技能／閃避／互動按下事件只在實際 fixed tick 消耗，避免高更新率渲染先吃掉；保存刷新不清連續輸入。
2. 三選一卡片整張背景／邊框／圖示／光暈依藍紫青黃顯色，移除以顏色名稱取代呈現的標籤。
3. POST_CLEAR 保留普攻與職業技能，暫停／選卡仍凍結。
4. 普通房總數保留 8–12（詞條另加），有限分批增援，前兩房同屏 4、後兩房 5。草原行走 74／48／65／55／45，加入個體接近角度、預先分離和不同站位距離。
5. 全新原創 96px atlas：三職業、五怪、兩領主、樹／岩／柱／水／門、補包與經驗晶體；層次輪廓、盔甲、鬃毛、彎角、衣袍與陰影。獨立重繪，未複製原作 sprites；manifest CC0。
6. 瀏覽器可用高度放大舞台，保留 8:5，不需捲動頁面；桌面側欄取代大量留白。
7. 扇形揮砍／反擊、弓弦放箭／快射、法杖蓄光／行星爆、閃避殘影、技能領域與命中／爆炸粒子。
8. 59 卡另有玩家用語描述，移除「第 5 節」「依規格」等開發文字；操作／狀態／融合名稱與關卡提示修訂。
9. E 拾取裝備／靠近右門按 E 換關；站在門口不自動離場。
10. 保留六種模板骨架，再按種子添加樹岩群、保留寬路與分支；草地花草、碎石、蜿蜒步道和岩岸，不再只用平鋪方格。敵人分散且避開掩體生成。
11. 本局分數／擊殺／XP 進度，側欄常駐實際屬性、元素與裝備。
12. 小怪預警 .7 秒、遠程 .6 秒，Boss 初次衝刺 .8 秒、連續 .45 秒；蓄力停下、鎖定方向，普通衝刺 240、Boss 310；衝撞期間不被行走 AI 改向。
13. 山羊王環彈完整 360°／16 方向，無人工缺口。普通持杖哥布林扇射缺口保留其定位。
14. 狼王／山羊王各自重新繪製，放大輪廓，附蓄力壓身／衝撞傾斜／階段光環與轉場動畫。
15. 房 XP 配額 100＋20×min(room−1,4)＋10×max(room−5,0)。前四房各升級、第五房後 Lv.6；31 房無經驗加成配額驗算為 Lv.26。召喚不給經驗，精英權重為雙份；仍用正式升級需求。
16. 可回收加色光暈、冰晶／凍結晶殼、火星／焰環／火徑、水紋／泡沫／漩渦、閃電鏈／電場、蒸氣與冰火交替效果；主副投射物透明度區分。預警與敵彈保持高層。

詳細調參前後值與最新操作覆蓋在 GAME_SPEC「第一里程碑試玩修訂」。

## 驗證

雲端 Node24，正式 Vite build、Playwright Chromium WebGL。

- PASS：check／build／format:check。
- PASS：102 項 unit（原 88 項＋14 項新增），CARD01–59、兩 Boss 各階段三招、完整環彈方向、左右鍵同施放、fixed tick 事件保持、清關攻擊、E 進門、有限增援、逐房升級／31 房配額、50 種子 AI、存檔／來源／控制等回歸。
- PASS：三職業固定 seed 23 首房正常 HP／攻擊／技能可清關，不修改敵人 HP、不開免傷；控制器用正常命令，這不等於人類完整五房平衡驗收。
- PASS：9 項 Chromium（既有 3＋新增 6），三職業真左右鍵並按並匯出狀態核驗、清關攻擊與 E 換關、整張卡片配色、1920×1080／1366×768／1280×720 舞台等比及無頁面捲動、兩 Boss 與元素場景、IndexedDB checkpoint／穿戴保存／重載。
- 實際 WebGL 截圖用於檢查光效與輪廓，並修復弧線渲染沿用前一段路徑造成跨場連線。測試截圖輸出 test-results（不提交暫存檔）。
- NOT_RUN：實體 GPU 60FPS／最密 600 彈／10 次重啟記憶體分布、Firefox／Safari、人工三職業完整一般及強構築五房／全 v1 平衡。headless 不冒充上述項目。

## GitHub Pages

使用者已將儲存庫設為 public、Pages Source = GitHub Actions，並允許 `implement/s00-s05` 部署到 `github-pages` 環境（另保留 main）。Pages 工作流程先 check／unit／format／Chromium，通過後以 `SOLARIA_PAGES=1` 建置 `/Solaria-Remaster/` 子路徑，upload-pages-artifact＋deploy-pages。

正式試玩網址：https://sces5504.github.io/Solaria-Remaster/ 。

- PASS：遊戲修正版 `6776b7c7b279bc15ffec75f1205c6fc29fc5a2f3` 已發布。Pages run [38134987440](https://github.com/sces5504/Solaria-Remaster/actions/runs/38134987440)，build／deploy 均 success；deployment `6994765136`。
- PASS：同版本 Development checks runs `38134987410`／`38134990147` 均 success。
- PASS：直接使用正式 Pages 網址的雲端 Chromium 驗證：HTML、CSS／JS、atlas／三職業肖像／manifest 均 HTTP 200；WebGL 法師新局、真實左鍵保持＋右鍵施技、舞台比例／無頁面捲動、IndexedDB 保存及重載回房間入口；pageerror 與 HTTP 失敗均為零。
- 線上檢查使用瀏覽器 fetch 驗證素材；Node 的獨立 API request 不走環境代理，首次驗證在該請求階段遇連線限制，改用瀏覽器同源請求後完整通過。
- 此文件記錄的是已驗證遊戲 commit；後續文件提交不代表新玩法版本。

Draft PR：https://github.com/sces5504/Solaria-Remaster/pull/2 ，base `docs/solaria-cloud-spec`；保留 main，沒有合併主分支。先前 Sites 部署不是本次交付，不再更新。

## 第二輪八項微調（2026-10-11）

- 主角sprite移除固定武器，只保留瞄準武器與動畫。
- 清算立即回血／計分，XP與補包吸附1.1秒後才選卡；中途checkpoint可恢復且不重複獎勵，殘留傷害保留。
- 草原與Boss房改成種子式程序生成，保留環境材質風格，增加掩體，檢查全可走格連通；普通房4–10隻初始／同屏上限。
- 狼王HP6500→3600、山羊王6500→4000；狼94、持刀88、狼王85基礎移速，史萊姆／遠程維持較慢速度，突進及預警不變。
- 地面裝備的稀有度光柱、亮芯、上升粒子、名稱與E拾取提示；門口E進入提示。完整橘紅裝備能力仍屬S10。
- PASS：107項unit（新增清算飛行／中途存檔、100種子敵群、120個種子房型連通與掩體量、Boss血量、E提示）。初次與軟體WebGL同時執行時400種子卡池測試超過5秒，改用數值網格連通檢查減少生成成本後回歸通過，未放寬原測試時限。
- PASS：check／build／format:check。10項Chromium場景：本機既有9項通過，新增清算／裝備測試補上匯入覆蓋確認處理後重跑通過；正式CI完整10項亦全數通過。

- PASS：修正版遊戲commit `83e47cab706a8d925e64f2a3d72cb947c28bad9f` 已在 GitHub Pages 發布；[Pages run 38137656597](https://github.com/sces5504/Solaria-Remaster/actions/runs/38137656597) build／deploy均success，完整107unit／10Chromium通過。
- PASS：直接正式網址雲端Chromium驗證HTML／資源HTTP200，atlas SHA256與本輪素材一致、WebGL新局、左鍵保持右鍵技能、等比無捲動、IndexedDB重載、實際地面光柱／E提示／拾取。pageerror及HTTP失敗為零。
- 本次記錄的遊戲版本為83e47ca；後續只更新驗證文件的提交不改玩法。

## 接續範圍

S06–S14 未開始：八個新增地形／16 Boss、最終三血四柱、26 後續卡、橘紅裝備／事件／成就、周目及完整 v1 平衡。從本分支接續，保留 59 卡與草原回歸。舊存檔可讀；建議新局體驗修正版敵群與 XP 曲線。
