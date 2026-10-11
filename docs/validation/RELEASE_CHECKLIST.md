# v1發布核對

版本1.0.0；branch implement/s00-s05；PR2的base保留docs/solaria-cloud-spec，不合併main、不force push、不改舊作。成果從9f88061交接及53691bf遊戲接續；開發中依序推backup/v1-progress-2026-10-11，不把部分成果部署正式站。

## 已接入內容

- 九地形、每地形六主題與seed變體、29普通怪、機關／詞條／獨立精英能力；TERRAIN_MATRIX逐項。
- 18地形王每位兩階段各三招，獨立布局與按能力構成的光束／落擊／吐息／斬擊／彈體；BOSS_MATRIX含穩定招式ID。兩事件王與索拉里斯另列。
- 30＋1、索拉里斯三血／四柱／字幕／封印、周目構築繼承與新裝成長。四柱維持使用者指定的旋轉60°通路例外。
- 85卡逐卡抽取／代價／級別／互斥／失效；八橘／三普通紅／六事件紅装，夥伴、吸血、百分比獨立來源與卸裝回歸；CARD_MATRIX、EQUIPMENT_MATRIX。
- 聖誕／血月／萬聖／外星／流星／軍隊三有限波、兩事件王、專屬紅裝、整局一次跨周目與重載；EVENT_MATRIX。
- 全房8:5／四尺寸、HUD／教學／圖鑑／成就／外觀／音效、永久收藏不加戰力、IndexedDB前版回復／原始壞檔保留／revision／配額／資源失敗／交易離頁保護。
- 真接觸時間序／SpatialGrid／退休物件重用、每傷獨立文字、Cloud10／30重啟、密集功能與24場周目曲線；BALANCE_PERFORMANCE。

## 發布前後

必跑check／unit／build／browser／format，browser期间不改dist。GitHub Pages Actions在既有允許分支上build、全部CI回歸成功才deploy。正式網址驗證子路徑資源200及本地來源SHA256、正常新局／同時左普攻右職技／保存reload、直接繼續53691bf原始核心生成的旧IndexedDB格式並再次保存。

工具：PLAYWRIGHT_BROWSERS_PATH設定後，`./node_modules/.bin/playwright test --config tools/validation/pages.config.ts`。子路徑預檢先SOLARIA_PAGES=1 build，再以相同環境啟動4174 preview並設SOLARIA_VERIFY_URL=http://127.0.0.1:4174/Solaria-Remaster/；發布後預設正式網址。這是實際URL測試，不代替人工通關。

## 明示未驗收

CloudSwiftShader壓力未達60FPS；真GPU60FPS／600彈連續60秒、真設備10restart GPU記憶體、Firefox／Safari、三職一般／強構築正常取得的完整30＋1人工試玩、1／2／5／10周目人工平衡、人工聆聽／全部短FX逐幀目檢：NOT_RUN。不能稱全部硬體與人工驗收完成，也不把合法fixture通關當自然全程。

最新執行結果、實際發布hash／Actions連結／線上驗證與剩餘事項見PROJECT_STATUS及CURRENT_STATE首節；本清單不預先宣稱部署成功。
