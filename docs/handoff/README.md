# 兩個new chat交接入口

2026-10-12新指示：主人已選定精雕冒險像素，要求本美術chat直接更新全遊戲；三款選樣等待選定的舊狀態已取代。完整美術與渲染已接入art/style-lab／PR4，正式發布與最終checks以CURRENT_STATE最新首節及docs/art-upgrade/VALIDATION.md為準；不要恢復多人預留計畫，不把歷史演示當全遊戲新版。

使用者在2026-10-12明示：本輪五項修正完成後準備兩份完整prompt，分開遊戲調整與美術。這不是自動建立chat或啟動代理。

- 遊戲調整：全文複製 `GAMEPLAY_NEW_CHAT_PROMPT.md`，數值／機制／Bug與兩邊整合／GitHub Pages發布。
- 美術：全文複製 `ART_NEW_CHAT_PROMPT.md`，sprite／專屬FX／UI／音效呈現，獨立art分支交遊戲窗口整合。

兩份皆自包含背景與完整必讀索引，不需舊聊天。確切最新部署commit／結果看PROJECT_STATUS與CURRENT_STATE首節，不回退旧hash。兩邊使用獨立worktree／分支，不競爭推implement，不force／merge main；共享記憶由整合窗口納入增量。未完成S13硬體與人工仍明示保留，不能因接手或本輪Bug修復把NOT_RUN寫PASS。
