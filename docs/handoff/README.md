# 新 Chat 交接入口

主人最新指示：美術定稿於1.1.2，後續只由遊戲調整窗口處理機制、數值與Bug，正式整合及發布轉為main。

- 完整交接prompt：[GAMEPLAY_NEW_CHAT_PROMPT.md](GAMEPLAY_NEW_CHAT_PROMPT.md)。可全文貼到新Chat，或用下方短指示讓AI先讀此檔。
- 固定1.1.2備份與恢复：[BASELINE_1.1.2.md](BASELINE_1.1.2.md)。不得修改tag、archive分支與Release附件。
- 現況／證據：docs/ai-memory/CURRENT_STATE.md、AI_HANDOFF_MASTER.md、PROJECT_STATUS.md。
- 原主人提供的1.0.1舊稿完整保留於archive/GAMEPLAY_PROMPT_PRE_ART_1.0.1.txt，只作歷史，已被新版取代。
- ART_NEW_CHAT_PROMPT.md與其他雙窗口敘述是歷史。不要另啟美術窗口或重做風格選擇。

可直接貼用：

```text
你接手 Solaria Remaster 的機制、數值及 Bug 調整。請先取得 https://github.com/sces5504/Solaria-Remaster 的遠端最新 main，完整讀 docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md、docs/handoff/BASELINE_1.1.2.md 及六份 ai-memory，再依其中要求接續實際工作，不從骨架重做。美術已定稿於1.1.2，後面維持目前素材、風格與呈現；只處理美術以外的調整。所有正式更新合併、發布到 main。v1.1.2 tag／archive/v1.1.2／Release 是固定備份，不得改動。保留他人工作，不reset或force push，不自動開Chat或agent。小修只跑相符的驗證，已有證據的事項不重做，未測不得寫PASS。先核驗現況與已知候選，持續完成可獨立處理的非美術工作，並接續我的新回饋。
```
