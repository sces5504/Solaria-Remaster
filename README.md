# Solaria Remaster

日蝕之後，穿越秘境尋回日光。第一里程碑已實作三職業、四草原普通房與隨機狼王／邪惡山羊王、59 卡與基本構築保存。製作者：Mori Fang。

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

WASD 移動，滑鼠瞄準；按住左鍵普攻、右鍵職技、空白閃避（無無敵）、E 拾取／進門、I 清關整備、C 構築資訊、Esc 暫停。清完房間後靠近右門按 E。每局四個不重複普通模板，再遇兩隻草原 Boss 之一。

戰鬥讀檔回入口，選卡與清關裝備操作自動保存在 IndexedDB。主選單可匯入，暫停／清關可匯出備份。失焦需手動繼續。草原末關明確結束里程碑，第二次任務接續 S06–S14。

原創像素素材與合成音效來源在 public/assets/manifest.json。已執行／未執行的測試與託管狀態見 PROJECT_STATUS.md，headless 不代表實體 GPU 60FPS。

GitHub Pages 試玩目標：https://sces5504.github.io/Solaria-Remaster/ 。由 `.github/workflows/pages.yml` 在 `implement/s00-s05` 推送通過驗證後部署；實際已發布版本以 PROJECT_STATUS.md 為準。
