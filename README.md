# Solaria Remaster

日蝕之後，穿越秘境尋回日光。三職業、九地形、29普通怪、18地形王、索拉里斯三血四柱、85卡、17特殊裝備與六事件。30＋1關完成後可保留構築進入下一周目。製作者：Mori Fang。v1發布狀態與實際驗證以PROJECT_STATUS為準。

正式需求見 GAME_SPEC.md、ARCHITECTURE.md、DEVELOPMENT_PLAN.md、DECISIONS.md、UI_UX_SPEC.md、TEST_PLAN.md、AGENTS.md、PROJECT_STATUS.md。第一次／第二次交付規則見 CLOUD_START_PROMPT.md。

## 雲端開發

Node24、npm lockfile、PixiJS v8 WebGL、TypeScript、Vite、Vitest、Playwright Chromium。原作 sces5504/Solaria 僅只讀參考。

```sh
bash scripts/cloud-setup.sh
npm run dev -- --port 5173 --strictPort
```

```sh
npm run check
npm run build
npm test
npm run test:browser
npm run format:check
```

預設 build 使用相對資源路徑。Pages build：`SOLARIA_PAGES=1 npm run build`。測試和開發不需要主人電腦常開。

## 操作

WASD 移動，滑鼠瞄準；按住左鍵普攻、右鍵職技、空白閃避（無無敵）、E 拾取／進門、I 清關整備、C 構築資訊、Esc 暫停。戰鬥中也可 E 拾取，穿戴需清關。清完房間後靠近右門按 E。每段四個普通房和一位領主，經六段分支秘境抵達索拉里斯；每地形六種主題與專屬王房依種子生成，事件會替換合格普通房。清算先吸收地面經驗／補給再選卡；地面裝備有光柱及靠近 E 提示。每次三選一可免費刷新一次，取得過的卡片會留在「光的記憶」圖鑑。

戰鬥讀檔回入口，選卡與清關裝備操作自動保存在 IndexedDB。主選單可匯入，暫停／清關可匯出備份。失焦需手動繼續。保存於IndexedDB，清關與選卡自動提交；保存中暫停選擇並保護離頁，衝突或損壞提供復原／備份。星典、成就與外觀只收藏，不提供永久戰鬥成長。

原創像素素材與合成音效來源在 public/assets/manifest.json。已執行／未執行的測試與託管狀態見 PROJECT_STATUS.md，headless 不代表實體 GPU 60FPS。

GitHub Pages：https://sces5504.github.io/Solaria-Remaster/ 。由 `.github/workflows/pages.yml` 在 `implement/s00-s05` 推送通過驗證後部署；已發布修正版與線上驗證紀錄見 PROJECT_STATUS.md。

## 專案長期記憶

入口：[AI_HANDOFF_MASTER](docs/ai-memory/AI_HANDOFF_MASTER.md)，最新工作斷點：[CURRENT_STATE](docs/ai-memory/CURRENT_STATE.md)。其餘索引涵蓋完整規格快照、決策演變、使用者偏好與開發／Bug 歷史。這是持久化上下文備份，不代表現在正式交接或重新啟動；重大決策與里程碑應增量更新。

內容逐項索引：[地形](docs/validation/TERRAIN_MATRIX.md)、[Boss](docs/validation/BOSS_MATRIX.md)、[85卡](docs/validation/CARD_MATRIX.md)、[裝備](docs/validation/EQUIPMENT_MATRIX.md)、[六事件](docs/validation/EVENT_MATRIX.md)、[平衡與效能](docs/validation/BALANCE_PERFORMANCE.md)。Cloud軟體WebGL的密集場景未達60FPS；真GPU、Firefox／Safari與完整人工平衡仍NOT_RUN，不將功能測試當硬體驗收。
