# AI_HANDOFF_MASTER — 長期記憶入口（未來交接專用）

備份時間：2026-10-11 14:22:09 UTC。來源基準：`a1543a07484ef230e8d694e9c0b75e5ae2f5ede9`，分支 `implement/s00-s05`。

**這是長期記憶備份，不是現在交接、結束合作、重啟專案或啟動下一個開發任務。** 初次備份只整理文件、未改遊戲；之後授權的遊戲修訂與最新工作狀態見後續增量及CURRENT_STATE，不能將初次備份限制套到新任務。

可信度標籤：**[使用者明示]**＝目前仍可取得的使用者原話／需求；**[正式規格]**＝根目錄確認檔案；**[程式事實]**＝此基準版本的實作；**[驗證紀錄]**＝已有測試或部署證據；**[待確認]**＝衝突／未決；**[歷史資訊不足]**＝不能還原，禁止補造。程式與 AI 撰寫的驗證檔案不能單獨證明使用者曾確認某項設計。

權威順序：後續使用者明確指示優先於被取代的舊條文；玩法／數值看 GAME_SPEC，呈現看 UI_UX_SPEC，模組看 ARCHITECTURE。記憶檔案是恢復上下文的索引與歷史記錄，**不取代正式規格**。根檔案中的舊條文及本次附錄應按時間／覆蓋範圍解讀；不因儲存舊文而恢復舊設計。

## 最新增量：第一里程碑最後九項修改

2026-10-11 14:59:54 UTC：長期記憶已88954be提交推送；主人接續要求九項小改，並明示測試此版後再告知下一步。這不是S06–S14啟動。新光影、噴火、燼火+3、三場域縮小、強藍雷、冷卻條0–1、蒸氣0/.2/.4加命中代理、有限怪立即補4與無黑邊門已實作，128unit/type/build通過；17Chromium首輪16通過，fixture確認重複accept修正後新增2及舊元素2重跑通過；正式CI128unit／17Chromium、Pages與線上操作／視覺已通過；最新遊戲53691bf。詳細前後數值與觸發規則見CURRENT及GAME_SPEC末尾「第五輪」。其下14:22基準摘要／原文快照為歷史，不覆蓋本增量。已發現的M01–M07不因這九項自動修復。

## 1. 先判斷：現在並未交接

使用者明確要求本次只是備份，仍在同一對話持續合作。**讀到此檔案不等於收到新遊戲任務、重新執行啟動prompt、新開Chat或開始S06–S14。** 先讀使用者當前訊息和git status，再判斷授權範圍。恢復上下文不等於交付已經驗證、也不等於程式碼都符合規範。

Solaria Remaster是桌面單人俯視actionroguelike，日蝕後六重祕境尋光，三職業與二元素/融合構築。第一次S00–S05已產出草原五房/兩王/59卡/基本gear/settle/IndexedDB與四輪試玩修訂；正式九地形/85卡/最終31/周目/六事件/特殊gear是後續S06–S14，未開始。不要重做已成基礎或用第一milestone冒稱全v1。

## 2. 六份記憶索引與建議閱讀順序

| 次序 | 檔案                                             | 目的                                                        |
| ---- | ------------------------------------------------ | ----------------------------------------------------------- |
| 1    | [本檔案 AI_HANDOFF_MASTER](AI_HANDOFF_MASTER.md) | 入口與授權邊界、來源/恢復流程                               |
| 2    | [CURRENT_STATE](CURRENT_STATE.md)                | 更新時間/branch/live/當前任務/證據/NOT_RUN/真實衝突與下一步 |
| 3    | [USER_PREFERENCES](USER_PREFERENCES.md)          | 自主/質量/溝通/Cloud/Pages/不重複確認/維護共識              |
| 4    | [PROJECT_MEMORY](PROJECT_MEMORY.md)              | 玩法數字/UI架構綜述與GAME/ARCH/UI完整快照                   |
| 5    | [DECISION_HISTORY](DECISION_HISTORY.md)          | 四輪需求、舊方案取代、DECISIONS/PLAN/PROMPT完整快照         |
| 6    | [DEVELOPMENT_HISTORY](DEVELOPMENT_HISTORY.md)    | git/檔案地圖/bug根因/經驗/債、STATUS/TEST完整快照           |

接著讀**實時原規格**：[GAME_SPEC](../../GAME_SPEC.md)、[ARCHITECTURE](../../ARCHITECTURE.md)、[DEVELOPMENT_PLAN](../../DEVELOPMENT_PLAN.md)、[DECISIONS](../../DECISIONS.md)、[UI_UX_SPEC](../../UI_UX_SPEC.md)、[TEST_PLAN](../../TEST_PLAN.md)、[AGENTS](../../AGENTS.md)、[PROJECT_STATUS](../../PROJECT_STATUS.md)、[CLOUD_START_PROMPT](../../CLOUD_START_PROMPT.md)。它們是八份正式檔案＋啟動prompt，不依賴另一個對話／個人記憶同步。附錄是此時原文快照，以sourcecommit/SHA辨識；未來原檔案變更應以新正式資料與已確認需求更新增量，不把快照當永遠新。

## 3. 核心原則與不能重提的舊方案

- 繁中溝通，Cloud/CI開發測試，不依賴主人本機常開。已授權範圍自主完成，不只plan/S00、不每內部階段問繼續；新重要核心衝突要記錄再確認，不重複已解決許可。
- **GitHub Pages不是Sites**。公開已有授權與設定；implement允許environment已解決。舊Solaria僅參考藝術/介面/生成/玩法質感，禁止push/reset舊repo或搬整份monolithicHTML。
- Pixi8.22.0/WebGL、TS/Vite/Node24/lock；純60Hzcore與input/state/render分離、serializable stableID，為未來2–4coop留邊界，不提前網路。
- 玩法權威GAME、UI呈現、ARCH模組；後使用者明確更新優先。程式碼事實不是設計意圖，AI配套細節不是使用者原話。core trigger/class/elementcap2/fusion2/death無永久stat/source折扣/rarity/event不能偷偷改。
- WASD/mouse、leftheld+right並用、Space無無敵、E拾取/門、combat可拾但equip只清關、清算後可攻；8:5固定全房、fit無scroll、分數/屬性/裝備HUDside。
- 清算先救命與計分，XP/補包可見吸入1.1秒後選擇，裝留地，殘留危險自然完；每組選牌一次refresh儲存不可reload再刷。
- 六主題seed程式地圖，隨機不雜亂、不恢復固定預製，bosscover足；finite4–10活怪而非無限保持4；lore速度、預警rush鎖向；boss3600/4000、完整360環14方向235速度。
- 所有現有/未來技能明顯華麗亮；鏈粗、多層爆炸雷、freeze與slow與paralysis不同、charge不同dash；輕render震動不改物理。遊戲只一aimweapon、選角另持械portrait。未知圖鑑暗不透露，得過點亮/59原創能力圖；無永久戰鬥強化。
- 最新classCD5/6/3；range基準1.15、chainbase180實207；首段Lv6/31Lv26是XP數學預算不是完成31房實戰。不要拿舊F、7/8/5、6500、cap4/5或scaffold舊文覆蓋更新。
- 保留全部9地形/85card/18+final+eventboss/6event完整承諾。架構計劃/效能目標不是已實現證明；headless不等於真實GPU60fps，未跑列NOT_RUN，不造日誌/使用者確認。

## 4. 初次備份狀態摘要（最新狀態以本頁增量與CURRENT為準）

最後更新2026-10-11 14:22:09 UTC。工作目錄/workspace/Solaria-Remaster（環境改變需重新定位）。分支implement/s00-s05；快照源HEAD a1543a07484ef230e8d694e9c0b75e5ae2f5ede9，最後game061e7ee30766c2b1583aed775ff1c5f8331f221d。實際記憶提交hash看git log，避免檔案記錄自身hash迴圈。

試玩：[Pages](https://sces5504.github.io/Solaria-Remaster/)。[Draft PR2](https://github.com/sces5504/Solaria-Remaster/pull/2) base docs/solaria-cloud-spec，main未merge。最新game [Pages38143596680](https://github.com/sces5504/Solaria-Remaster/actions/runs/38143596680)build/deploy success，119unit/15Chromium；實際URL資源HTTP200與hash/WebGL/input/save/loot/reroll/catalog/test已檢，錯誤0。a1543a0的[檔案提交Pages38144054700](https://github.com/sces5504/Solaria-Remaster/actions/runs/38144054700)亦已查success；未來docspush同game再部署不算新玩法。S06–S14未開始。

本次memory審查發現而未修：M01壞檔驗證previous卻throw無自動回退；M02卡42條件升級實際無條件加普攻、相關classcards需查；M03地形危害詞條排程未完整；M04精英額外角色能力未完整；M05火+電控也可被共振當冰且交替用globaltime；M06完整pool/sweep/600整組效能未證；M07最終seal舊60°gap vs後使用者完整圓待S08範圍確認。詳見CURRENT區分靜態確定/候選/未實測，**本次沒修任何gamebug**。

NOT_RUN真實GPU60fps/最密600/10restart記憶體/FirefoxSafari/人工三class五房一般強構築/全v1平衡。最新FX釋出後尚無新使用者最終主觀驗收；不能寫使用者全部滿意。

## 5. 歷史缺口與證據恢復

來源等級見開頭；根規格為確認記錄、四輪需求為仍可見使用者話、code證明實作、CI與線上驗證證明特定版本。更早grilling訪談/全總審查逐字、已否候選全部理由、附圖原始檔、完整硬體資料是「歷史資訊不足」，不能透過摘要補造。若需要，先git show/log/原規格查，再提出具體缺口；不用讓使用者重說所有已存規則。

附錄覆蓋全部九檔案，PROJECT保留完整系統/卡/敵/事件/gear表，不因新AI摘要刪除。DECISION保留已替代與拒絕，DEVELOPMENT保留bug根因和失敗技術路。今後更新請增量、標舊狀態已取代與原因，保持UTC和master一致，不每次全重寫。

## 6. 後續恢復/開發步驟

1. 閱讀當前使用者實際任務，本入口與CURRENT。定位repo，git status/branch/log，保護未提交修改；不是看到prompt就reset到舊起點。
2. 按索引讀偏好/系統/歷史與根9檔案。列確定規格、程式碼事實、衝突、缺失，保留最新已明確更改。不要把本文歷史階段噹噹前待執行任務。
3. 驗證目標branch有真實gamecode與所需資產。當前純文件任務只檢查檔案；遊戲改動按check/build/unit/browser/format必要回歸。預覽dist先build後固定，不在browser執行中重build。
4. 授權任務完成後儲存小步commit、更新PROJECT_STATUS+memory關鍵檔案，記錄PASS/NOT_RUN與當前證據，必要publish仍Pages；未授權merge不merge。
5. 來源衝突如果影響擬進行的core決策，先把具體兩邊來源與差異說明；不能為了不問繼續而偷偷變核心，也不能每stage重複確認已授權範圍。

## 7. 真正未來跨Chat可直接用的啟動Prompt

> 你正在接續 sces5504/Solaria-Remaster 的長期開發。先定位現有repo並讀docs/ai-memory/AI_HANDOFF_MASTER.md，再按索引讀CURRENT_STATE、USER_PREFERENCES、PROJECT_MEMORY、DECISION_HISTORY、DEVELOPMENT_HISTORY，並讀根目錄八份正式檔案與CLOUD_START_PROMPT。核對git status、branch、最近commit與真實部署，不重置／覆蓋未提交修改，不依舊聊天完成宣告推論現狀。程式只證明實作，不證明使用者設計意圖；後使用者明確更新覆蓋舊條文，其餘衝突標記待確認，缺史標「歷史資訊不足」不得補造。採用繁中、Cloud/CI，GitHub Pages不是Sites；原Solaria只讀參照。第一milestoneS00–S05已做與多輪修訂，別重新scaffold；S06–S14狀態看最新CURRENT，不自動啟動。先遵循我在這個Chat的新任務，授權內自主完成必要實現與驗證，別逐階段問繼續。保留elementcap2/source分類與副鏈/無永久能力/reroll儲存等核心。真實測試/未跑如實列出，headless不代表實機FPS。重大決策/bug/里程碑/架構及時增量維護記憶與UTC/MASTER，不刪歷史，不寫金鑰。當前具體新任務是：【由使用者填入本次任務】。

上面Prompt只在**未來使用者真正決定跨Chat時**使用；不是此次執行指令。繼續當前對話不需任何重新啟動流程。

### 第五輪正式發布與線上驗證（2026-10-11 14:59:54 UTC）

- PASS：遊戲commit `53691bf925df3c39a5f20613ff7acdba900b1bb7` 已部署 GitHub Pages；[Pages run38148633408](https://github.com/sces5504/Solaria-Remaster/actions/runs/38148633408) build2分52秒／deploy11秒，兩者success；正式CI完整128unit／17Chromium全數通過。
- PASS：正式網址 https://sces5504.github.io/Solaria-Remaster/ 的Cloud Chromium實測：HTML／CSS／JS／atlas／三持械肖像／manifest／背景HTTP200，atlas與本輪SHA256一致；法師正常新局、左held＋右技能、8:5無捲動、IndexedDB保存／回入口、E裝備拾取、Pages子路徑背景、選卡刷新使用讀檔不重置、pause／catalog、測試按鈕位置及59卡搜尋／給卡／前置／能力重載，pageerror／HTTP失敗皆0。
- PASS：額外正式URL兩項視覺核驗：扇形噴火／蒸氣水柱／強光藍雷／新石門實際畫面；藍雷發光前後同地面位置亮度比較>15%，冷卻就緒100秒的腳下條不超出角色。線上首次亮度比較在頁內截圖影像解碼處逾時；改在Cloud以PIL分析同一WebGL截圖後通過，未改或放寬亮度／長度斷言，亦未修改線上遊戲。原因只定位到測試取樣步驟，不能宣稱是遊戲Bug。
- 全部102 atlas影格四角透明；逐影格RGBA差異只有六門影格，三張持械肖像內容完全不變。四角檢查不等於完整alpha邊緣審計。
- 實機GPU60FPS、600最密彈、10次restart記憶體、Firefox／Safari、人工完整五房構築仍NOT_RUN；後續S06–S14仍未開始。等待主人試玩此版後告知下一步，不自動擴張內容或另開Chat。
- 本紀錄跟隨文件提交不改遊戲；最新遊戲仍53691bf，main未合併，原作只讀。既有記憶M01–M07未因本次九項自動解決。
