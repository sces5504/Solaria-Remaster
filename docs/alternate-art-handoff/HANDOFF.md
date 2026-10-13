# Solaria Remaster：另一專案美術替換交接

## 交接用途與固定來源

本文件供另一個已有美術資源的專案，建立 Solaria Remaster 的獨立副本並替換美術。這是主專案開發之外的試作；不修改主專案、不回合併、不共用正式發布位置。

- 原始儲存庫：<https://github.com/sces5504/Solaria-Remaster>
- 遊戲基準：`v1.2.0`，固定 commit `239cac7a342944a10bcacadce977f77fdf57d983`。
- 交接時遠端 main：`8df5e347cc1a5bc977e848478378c35f672cc5a7`；與上述版本的遊戲程式一致，另有發布交接文件。
- 版本入口：<https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.2.0>
- 固定來源下載：<https://github.com/sces5504/Solaria-Remaster/archive/239cac7a342944a10bcacadce977f77fdf57d983.zip>
- 可直接貼給接手專案的指令：[PROMPT.md](PROMPT.md)。

優先下載固定來源 ZIP，解壓到接手專案自己的獨立目錄，再以該專案的儲存庫管理。ZIP 不含來源 `.git`，可避免誤推回原專案。若使用 clone，必須先將 origin 改成接手專案自己的遠端，才提交或推送；不可把本次美術工作推回 Solaria Remaster。

不複製 node_modules、dist、測試輸出、憑證、環境秘密或私人存檔。保留原有素材授權／來源資訊；接手專案的素材也須確認可使用。來源以固定 commit 為準，不隨之後 main 的玩法開發漂移。

## 授權邊界

主人本次授權的是「在獨立副本使用另一專案之前做好的美術」。原專案美術定稿與備份保護規則仍有效；副本中的本次明確授權僅放寬美術替換限制，不放寬玩法限制。

不得修改原專案 main、v1.1.2、archive/v1.1.2、archive/v1.1.2-files、任何備份下載檔、原作 Solaria 或原專案 Pages。不要執行 reset／force push。不要自動建立新 Chat 或 agent。副本若需上線，另用接手專案的發布位置，依主人對該專案的授權處理。

## 接手時先讀什麼

1. 先盤點接手專案既有美術：檔案位置、圖集、影格、尺寸、錨點、動畫、角色與場景分類及來源授權。不可假定不存在的素材已完成。
2. 在副本閱讀根目錄 GAME_SPEC.md、ARCHITECTURE.md、UI_UX_SPEC.md，以及 docs/gameplay-1.2.0/README.md，理解既有實作與 v1.2.0 差異。
3. 有來源脈絡疑問，再看 docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md、BASELINE_1.1.2.md 與 docs/ai-memory 六份記憶。它們提供歷史與權威規格，但其中主專案的後續開發待辦不是本次副本的任務。

不要使用另一專案的舊遊戲骨架覆蓋這份遊戲，不依賴舊 Chat，不恢復 1.1.2 的機制來配合舊美術。

## 必須保持完全一致的內容

以固定來源實作為準：職業、敵人、Boss、技能、卡牌、裝備、元素、事件、成長、掉落、傷害、血量、速度、冷卻、隨機抽取、難度、流程、存檔與讀檔全部不變。不得以美術需求更改碰撞、地圖障礙、移動、AI、攻擊幾何、命中時間、預警時間或輸入。

特別避免把 v1.2.0 改動退回：

- 各 Boss 的獨立雷射、彈幕、衝刺、多段近戰與目標位置攻擊模式全部保留。
- Boss 召喚戰鬥小怪為精英，HP 是同類一般精英的兩倍；上限、獎勵及物件型召喚規則保持原樣。
- 劍士格擋窗口 0.9 秒、成功格擋無敵 0.75 秒、反擊 0.3 秒、冷卻 5 秒，保持原樣。

保留 1024×640、8:5 的邏輯畫面與完整房間可見性、所有操作與 UI 功能。美術換皮不改按鍵、選擇流程、暫停、事件提示、結局、下一輪、匯出或存檔格式。角色／招式／元素的穩定 ID 不可因新圖像而改名或對調。

## 美術接線位置

| 範圍 | 主要位置 | 替換限制 |
| --- | --- | --- |
| Runtime 圖集與映射 | public/assets/adventure/manifest.json、同目錄 PNG | 核對實際影格與映射，保持遊戲身份對應 |
| 素材整理與打包 | tools/adventure/catalog.json、landmarks.json、pack.mjs、source-atlases | 使用接手專案已有素材，不強迫重畫 |
| 場景、角色與圖集讀取 | src/render/stage.ts、adventure-art.ts、actor-isolation.ts | 可改畫法／錨點，不改碰撞或狀態 |
| 光影與特效 | src/render/lighting.ts、adventure-effects.ts、ability-presentation.ts 等 | 新風格可替換，但保留元素／招式辨識與層級 |
| Boss 預警與攻擊呈現 | src/render/boss-telegraph.ts、boss-beams.ts、boss-actions.ts、boss-projectiles.ts | 形狀、距離、角度、持續時間必須忠實反映原攻擊 |
| UI 與結局外觀 | src/style.css、src/ui/、src/main.ts 中呈現部分 | 保留互動、資料與流程；不整份覆蓋 src/main.ts |

以上是查找入口，不代表所有列出的檔案都要修改。遊戲規則、資料、輸入與存檔模組保持原樣。渲染檔內若有混合職責，只動顯示部分。

新角色外觀可用顯示比例／錨點適配既有 hitbox；不可反過來改 hitbox。雷射、衝刺、範圍圈與落點不能為配圖縮短／拉長實際攻擊。敵方危險與子彈需清楚可見；保留元素與 sourceAbilityId 的語意映射，避免把不同招式全換成同一種爆炸。

素材缺項時先保留原素材或既有影格作暫時映射，明列缺口；不要刪掉敵人、招式、事件或 UI 功能。必須新增素材時才依接手專案流程補齊。

## 本次準備與後續實作

本次只提供交接文件與 prompt；未替換任何遊戲素材或程式，未執行測試，也不新增主專案記憶／進度紀錄。這份文件不代表換皮已完成或驗證通過。

接手專案真正換皮時，依主人當時的驗證要求進行；以修改前後差異確認玩法模組未變更，視需要做相關畫面與操作檢查。不要套用來源版本的 PASS 宣告新美術已通過，也不要為本次文件準備啟動完整測試流程。
