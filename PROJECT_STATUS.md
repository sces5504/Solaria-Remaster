# PROJECT_STATUS — 第一次里程碑交接

更新：2026-10-11。起點 `6399276`（`docs/solaria-cloud-spec`），實作分支 `implement/s00-s05`。正式玩法權威仍為 GAME_SPEC；第二次任務從此實作分支接續，不能從空骨架重做。

## 已實作 S00–S05

- S00：九文件讀取、乾淨工作區與 Node 24.19.0 核驗；npm ci、原骨架 check/build/Chromium 啟動通過。`--with-deps` 初次因非 root 失敗，使用雲端已備系統庫並安裝 Chromium，setup 已避免互動式 su。
- S01：PixiJS 8.22.0／WebGL、1024×640 等比全房；DOM 無關、可序列化、固定 60Hz 核心；鍵鼠命令、暫停與失焦清輸入。
- S02：三職業普攻／格擋／快射／行星爆／無無敵閃避；圓形與掃掠碰撞、護甲／盾／保護窗口、來源資格。
- S03：五草原敵人、六獨立模板，每局四個不重複普通房、隨機狼王或邪惡山羊王；兩 Boss 各兩階段三招、2 秒無溢傷轉場、交錯模式、Boss 掩體耐久。另一隻 Boss 在正常新局隨機遇到。
- S04：XP 與逐級三選一、清算回血／吸取掉落、補包序列、三裝備欄／12 背包／F 最近拾取；交易式 IndexedDB 檢查點、入口重玩／已呈卡组保留、匯出匯入與 revision 衝突提示。
- S05：59 張卡（14 數值、26 元素、19 職業）、兩元素容量／三種融合、資格卡池、來源折扣、防追加循環；原創像素 PNG atlas、獨立傷字、預警／元素特效、合成音效／音量／靜音、繁中 UI、正常入口與草原結束畫面。

## 可復現驗證

雲端 Node24，正式 Vite build、Playwright Chromium WebGL；無主人電腦依賴。

- PASS：`npm run check`、`npm run build`、`npm run format:check`。
- PASS：`npm test`，88 項，含 CARD-01..59 實際行為、Boss 兩階段各三 attackId、格擋／快射、同幀清算、副鏈、控制遞減、卡池、模板路徑、50 seed AI 回歸、裝備和 schema。
- PASS：`npm run test:browser`，3 項：主選單／三職業／操作／暫停／入口重載；59 卡圖鑑／音效持續；真 IndexedDB 選卡不重抽／穿戴保存／重載。
- 房間與結尾狀態轉移測試使用結算 fixture；Boss 招式觀察使用純核心場景。上述結果不等於三職業人工完整跑局與平衡验收。
- 修復：極近距敵人分離重用舊距離造成異常位移；分離向量兩側一次計算，另加路徑快取。副箭同施放對同敵只推一次連射專注；位移斬獨立命中集合；左右鍵同時操作互不取消；地雷武裝／接近延遲爆破；每次傷字使用獨立事件 ID。

## 試玩託管

- GitHub Pages 管理 API BLOCKED：GitHub App 回傳 403 `Resource not accessible by integration`。未更改 main 或儲存庫可見性，沒有冒稱 Pages 已發布。
- 改用 Sites 第一里程碑試玩託管，project `appgprj_6acb58d27758819188664258f430c33e`。原生部署狀態 `succeeded`：https://solaria-remaster-twilight.paleswift64.chatgpt.site 。deployment `appgdep_6acb5d4b13a08191a47f701165a1b804`，version `appgprj_6acb58d27758819188664258f430c33e~appgver_235936c3c878819182c743726da6e985`，託管來源 commit `d61adbbe2397e4fb664523b4e65ca13113bdb807`。
- Sites 目前為私人、僅擁有者可存取；公開存取調整被平台自動審核拒絕，理由為本次訊息沒有明確授權公開私人專案。沒有繞過審核或調整其他分享方式。
- Draft PR：https://github.com/sces5504/Solaria-Remaster/pull/2 ，base 為規格分支；已推送、未合併 main。
- Vite 有 `SOLARIA_PAGES=1` 的 `/Solaria-Remaster/` base，預留具管理權限時部署 Pages。

## 未完成與待驗收

- NOT_RUN：實體 GPU TEST_PLAN 的 60FPS／最密 600 彈壓力／10 次重啟記憶體分布；Firefox／Safari；人工三職業一般／強構築跑局與平衡。headless 不冒充設備性能。
- 里程碑裝備池為藍／紫／黃基本詞條裝備；橘紅固定能力依 S10 接續，沒有用空能力橘紅湊數。
- S06–S14 未開始：八個新增地形／16 Boss、最終三血四柱、26 後續卡、特殊裝備、六事件、完整圖鑑成就、周目與完整 v1 平衡／正式 Pages 发布。
- 仍以桌面鍵鼠為正式目標；觸控、英文、背景音樂、實際多人是後續範圍。

## 提交節點與第二次起點

S00 `2427793`；S01 `940da46`；S02 `72612b0`；S03 `c5769f4`；S04 `2fb9663`；S05 `71cdff5`，其後必要修復與交接提交 `63980aa`（遊戲交付版本），最新文件提交再記部署結果。每節點只是同一次任務內保存，未逐階段索取批准。

接續：讀本檔、git status 與最新實作分支；執行 `bash scripts/cloud-setup.sh`（包括有意義 unit tests）、`npm run format:check`；依 CLOUD_START_PROMPT 第二次任務由 S06 接續，保留既有 59 卡與草原回歸。試玩回饋／未測設備驗收與後續完整內容分開追蹤。
