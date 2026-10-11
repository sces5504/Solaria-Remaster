# Solaria Remaster

Solaria 的全新重製專案。原作：[sces5504/Solaria](https://github.com/sces5504/Solaria)。

目前是乾淨的開發起點，僅有畫布啟動頁；尚未移植或重做遊戲玩法。原作不作任何修改。

## 已準備的工具

- Node.js 24、npm 與固定依賴版本的 lockfile
- TypeScript、Vite：型別檢查、開發伺服器與正式建置
- Vitest：後續純遊戲邏輯單元測試
- Playwright / Chromium：瀏覽器啟動測試、截圖與互動測試
- Prettier：格式檢查
- GitHub Actions：在雲端自動安裝、檢查、建置及瀏覽器測試
- Matt Pocock 的 grilling：`.agents/skills/grilling/SKILL.md`

## Codex Cloud 設定

1. 新任務選 Work in → Cloud → Select environment → Create environment。
2. 選 `sces5504/Solaria-Remaster`，按 Get started。
3. 請環境設定助手使用 Node.js 24，執行 `bash scripts/cloud-setup.sh`。
4. 將啟動指示設為 `npm run dev -- --port 5173 --strictPort`，檢查 5173 連接埠的頁面可用。允許 npm 套件與 Playwright 瀏覽器下載所需網路目的地。
5. 確認 `.agents/skills/grilling/SKILL.md` 能被找到；若自動探索未載入，依 AGENTS.md 直接讀取。
6. 檢查設定及測試報告，儲存並按 Publish。出現 Environment published 後，才開始新的雲端任務。

這份 repo 的提交不等於 Codex Cloud 環境已建立或已 Publish。`.devcontainer` 是 GitHub Codespaces 的另一個雲端選項，不是 Codex Cloud 的安裝設定。

## 下一個任務

先使用 grilling 釐清重製目標，再製作第一個可玩版本。原作為 Canvas / Web Audio 的像素俯視動作肉鴿，三職業、元素反應、裝備與多種 Boss；細節以原作程式為準。

原作參考快照：`4a07ca67a614d63c4261cec5faba060ea9c34c50`。

Skill 來源：`mattpocock/skills` 的 `skills/productivity/grilling`，固定版本 `49dd158d1076134a641b33efb035946536778336`。授權見 `THIRD_PARTY_LICENSES/grilling.txt`。
