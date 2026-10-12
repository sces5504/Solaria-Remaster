# 第一里程碑實際格式快照

`53691bf-checkpoint.json`由已在線驗證的commit53691bf原始核心產生，未用v1的newRun假裝舊資料。固定弓手seed5504，使用舊版給卡入口配置15／50，執行120個正常攻擊tick；屬遷移fixture，不是自然取得構築或平衡通關。entry與current均通過舊版validate，新版validate亦通過。

正式網址測試直接寫入舊版IndexedDB鍵latest／discovered，沒有先經新版匯入转换。驗證繼續旅程依舊規則回到entry，保留職業／卡片／元素／房號，保存後reload可以繼續。

可重現產生：在本repo執行`git worktree add --detach ../Solaria-Remaster-legacy-verification 53691bf925df3c39a5f20613ff7acdba900b1bb7`，再執行`./node_modules/.bin/vitest run --config tools/validation/legacy.config.ts`。輸出於/tmp/solaria-53691bf-save.json與expected.json；驗證工具刻意只在明確取得此舊版checkout時使用，普通npm test不依賴外部路徑。原作sces5504/Solaria不涉及本測試。
