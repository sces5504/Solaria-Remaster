# Codex Cloud 開發啟動 Prompt

以下文字可直接貼到以sces5504/Solaria-Remaster為儲存庫、`docs/solaria-cloud-spec` 為起始分支的Cloud任務。規格已交接至此分支，尚未合併main；若環境目前在main，先保留工作並安全取得規格分支，確認八份文件存在後才繼續。禁止覆寫未提交修改。不要使用原作repo執行任務。

---

請在 `sces5504/Solaria-Remaster` 的 `docs/solaria-cloud-spec` 分支執行Solaria重製版的S00交接與環境核驗。需求訪談與總審查已完成，現在不要重啟grilling，也不要開始寫遊戲。

1. 先檢查實際Git分支與工作目錄，保留現有未提交成果。必須能讀根目錄GAME_SPEC.md、ARCHITECTURE.md、DEVELOPMENT_PLAN.md、DECISIONS.md、UI_UX_SPEC.md、TEST_PLAN.md、AGENTS.md、PROJECT_STATUS.md；缺檔先定位規格分支，不憑聊天猜設計。
2. 逐份讀文件，檢查85卡、19職業卡、26元素卡、18地形Boss／最終三血／6事件、快射計數／副鏈／暴擊分類／清算救命／存檔／明確v1範圍是否一致。若有核心矛盾記錄並停在交接核驗，不自行換玩法。
3. 使用已選Cloud環境及Node24、npm鎖定檔。執行bash scripts/cloud-setup.sh並依AGENTS跑npm run check、npm run build、npm run test:browser、npm run format:check。已有有意義unit tests才加npm test；不要寫假測試湊pass。
4. 確認目前只有啟動畫布，不是已完成遊戲；PixiJS／獨立60Hz核心等屬S01之後，本任務不安裝新遊戲依賴、不改玩法、不做全部階段。正常環境問題可自主修復與必要測試，重大設定或需求變更詢問。
5. 更新PROJECT_STATUS的實際環境、命令／退出碼／結果、未執行項目、已知問題、S00完成狀態及下一S01。不得把headless啟動成功當完整遊戲、60FPS或實機驗收；不得假定Cloud環境已Publish。
6. 回報文件位置／Git狀態／改動／測試證據及剩餘問題，S00完成後停止。後續只有在另一次明確任務指令要求時執行S01，不自動連做S01–S14。

原作sces5504/Solaria只讀，禁止推送／重置／刪除。第一里程碑三職業、暮光草原、兩隻Boss及基本構築清算；最終v1全內容依計畫逐步交付。數值調整可有證據自主處理，但不能取消已確認機制或換成別種遊戲。

---
