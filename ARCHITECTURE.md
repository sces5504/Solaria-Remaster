# ARCHITECTURE — 技術與資料架構

2026-10-11，CONFIRMED。以GAME_SPEC的玩法與數值為權威。

## 選型

沿用Node24、npm及package-lock、TypeScript、Vite、Vitest、Playwright Chromium、Prettier。新增PixiJS v8依賴於開發S01，安裝時確認相容並鎖定實際版本；本次文件提交不安裝遊戲依賴。正式畫面用WebGL，無WebGPU或Canvas fallback承諾。Pixi負責視覺，戰鬥核心不可import Pixi／DOM／音效。

選擇理由：固定全房、高頻彈幕、原創atlas與程式特效需要掌握批次繪圖；獨立核心也支援確定性測試與未來合作。代價是自行整合輸入、音效、場景與生命週期，已納入分階段計畫。

## 預定目錄

- src/main.ts：啟動／DI／資源完成後載入menu。
- src/game/core：clock、state、commands、events、rng、room FSM。
- src/game/systems：movement、collision、combat、effects、skills、progression、loot、settlement。
- src/game/entities：player、enemy、boss、projectile、area、companion、obstacle。
- src/game/data：cards、equipment、biomes、roomTemplates、enemy／boss／event definitions。
- src/game/persistence：schema、migration、checkpoint、profile、import/export。
- src/input：鍵鼠與held state，只產生命令。
- src/render：Pixi application、scene layers、atlas、animation、particles、lights、damage text。
- src/ui：menu、HUD、cards、inventory、stats、pause、end、tutorial、catalog。
- src/audio：音效混音、volume、mute，預留music channel。
- src/i18n：穩定key與zh-TW字串。
- public/assets：原創PNG atlas、metadata、音效與來源／授權清單。
- tests/unit、tests/browser：純規則與真瀏覽器測試；不用試玩page替代核心測試。

## 模擬與事件

固定步進1/60秒。command包含tick、actorId、intent、pointerWorld，輸入與state可序列化。PlayerAttack、SkillCast、Dodge、Interact各經能力／phase／control／CD驗證才發出事件。排程用simulation時間；暫停不累積catch-up backlog。

狀態保存runId、class、level、XP、cards map、elements、fusion、stats ratings、equipment IDs、bag slots、room／wave／phase、route seeds、RNG streams、event seen set、drop counter。房間state保存entity table、effects、projectiles、obstacles durability、pending emissions、settledOnce與upgrade queue。render讀快照與一次性事件，不寫HP／卡池／掉落。

DamageContext必含sourceAbilityId、ownerActorId、rootAttackId、damageKind、elementMask、canCrit、lifestealEligible、basicEffectMask、basicHitProxy、basicCastProxy、procPolicy、ancestry、chainScale。子傷害不盲目copy父暴擊資格，按定義重建；保留chainScale。爆血percent獨立kind，不走一般增傷。

施放計數只由BasicCastEvent推進；副箭、折射不發該event，快射每箭發。右元素只由整次ClassSkillCast發。所有傷害觸發只走一個dispatcher，加入回入檢查；同一動畫不能在不同系統重複給傷害。

## 碰撞、地圖與AI

32×20格、格32，邊界牆與高度阻擋。circle／segment檢測，連續sweep避免700速度穿薄牆。雷射掃到第一高度實體截斷；爆炸與地面範圍不做遮蔽。lake／lava是walkBlocked但projectileBlocked=false。

空間網格供近鄰／範圍／鏈目標，結果依距離及ID排序以便重現。敵尋路在模板grid上，掩體碎裂更新通行圖；不能卡死在孤島。普通敵軟分離，boss指令制攻擊排程遵守同時mode上限。玩家與南瓜對敵target選擇使用合法最近距離，無全場強制嘲諷。

地圖seed只選完整驗證模板及允許的變體。path validation失敗重試有限次後用該地形已知合法模板；不改seed去重抽已決定裝備。

## 統計與數值

原始加成同類相加，類別加成與一般全域因子各一次；技能／普攻類別唯一，元素標籤有兩個也不雙乘通用元素傷。derived stat單一函式服務核心與資訊頁。CD存施放時間／deadline或正規化work units，不靠UI進度條算。臨時buff生滅即重算真實速率，不補打歷史攻擊。

所有每級傷害增量、第五級機制封頂、第六級後邊際規則由資料函式表達，不複製到UI。副鏈折扣在DamageContext最末套一次。命中／施放／週期打擊／附著跳傷的分類以GAME_SPEC為準。

## 保存與生命週期

IndexedDB內run與profile分離，用revision及transaction保存；settings小型音量設定可獨立儲存。保存入口快照及最近有效clear checkpoint。每次選卡、clear後拾取／丟棄／換裝持久化。同一物品ID只允許一位置，重新讀取以revision合併而不是重新生成。

載入先schema validate→version migration→invariants→resume phase。重複舊tab以run revision提示使用最新或放棄舊操作，禁止兩tab複製同物品。關頁/失焦觸發暫停與可持久化工作；COMBAT reload從已保存入口，不能把未結算獎勵帶走。

格式損壞／quota不足顯示明確訊息，保留上一份，提供可複製備份；不靜默覆寫profile。匯入JSON只讀白名單schema，無腳本／HTML執行。存檔無圖片，產物assets版本hash與run schema分開。

## 渲染與音效

邏輯1024×640、8:5等比fit容器，不拉伸座標；pointer透過inverse scale轉世界座標。像素sprites nearest，程式light可用linear低解析render target。layers：terrain→obstacles→actors→friendly effects→hostile danger→damage numbers→HUD，敵方危險不能被華麗全屏shader覆蓋。

投射物／粒子／數字物件池，atlas批次與bitmap數字字形；不為每彈創建filter。敵彈預算600通過延後整組新模式發射實現，不刪已有效彈。裝飾粒子最多2000可回收。傷害數字仍每次獨立，不合併或偷刪。GPU和CPU測量分別記錄。

音效由事件映射，只解鎖一次AudioContext；音量／靜音跨局保存。預留music channel但不放背景音樂。

## 靜態部署與未來合作

Vite build到dist，專案Pages base為/Solaria-Remaster/，資源不硬寫根路徑。Actions建置、artifact→Pages；採pages:write、id-token:write與github-pages environment。第一里程碑若無可分享Cloud預覽可提前部署Pages試玩版，正式v1在S14更新；本地文件階段不變更可見性或發布。

後續2–4人合作採用權威核心狀態、command tick與穩定ID。無網路code/房間backend/重連協議第一版；future房間服務單獨托管，Pages只托管前端。可序列化資料和owner/faction欄位先保留，不導入未使用同步SDK。

## 雲端與測試

環境執行bash scripts/cloud-setup.sh，Node24、npm ci、Chromium及檢查命令沿用。檢查結果不能由本機套件狀態推斷。新資料先做schema／invariant測試，核心直接用seed+command trace測試，瀏覽器只測交互與資源／視覺。完整品質門檻見TEST_PLAN。
