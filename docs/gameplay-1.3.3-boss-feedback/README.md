# Boss 殘血與落雷小修試玩

本輪等待主人確認才推 main。分支 `gameplay/v1.3.3-boss-feedback`；正式 main 保持 `b2d3df37567bf1e28ea4dadd60998ecd3d435632`，不發布新正式 tag／Release。

根因：合法落點 helper 以 `{...target}` 複製目標，mode.target 實際存有完整玩家資料；瞬移／跳躍／鑽地 Object.assign 到 Boss 時，血量被換成玩家 HP，半徑等也被覆蓋。修正 helper／建立與續段目標只取座標。舊快照亦受保護，不靠延長無敵或提高Boss血量掩蓋問題。

落雷 `wolf-hunt`、`witch-thunder`、`brain-storm` 首發預警0.6→1.1秒，逐落間隔0.25秒保持；範圍／傷害不變。其餘招式與普通怪保持。

包含上一輪未提交的生命成長死亡保護（移轉／清算不得補活死亡），不回退既有生命曲線與曝光修正。

修正前 `results/before-fix.log`：9失敗／16通過，7項位移確實把Boss HP換成玩家37點，2項新落雷時間要求尚未達成。修正後初輪112通過／1失敗，為舊狼王素材測試仍使用0.6秒觸發時間；更新成1.1秒後113相關unit通過，證據unit-old-timing.log／unit.log。build.log通過。瀏覽器、CI與線上預覽尚待，不提前標PASS；不代表完整瀏覽器、跨瀏覽器或真GPU自然全流程驗證。保護既有工作與固定1.1.2／備份素材，不開Chat或agent。

本地實際Chromium：3個Boss位移／匯出案例通過；附帶生命案例初次在載入完成前讀診斷而失敗，增加等候遊戲overlay後，單項重驗通過（12.1秒），原始失敗browser-before-load-wait.log保留。check／format通過，CI與線上尚待。

## 試玩交付（2026-10-14 02:30:19 UTC）

[試玩網址](https://sces5504.github.io/Solaria-Remaster/preview/terrain-1.3.0/?v=boss-fix-411c8a4)，獨立preview命名空間沿用，不讀寫正式遊戲保存。遊戲來源 `411c8a462c5dfaab6947a44ecc98bb288d2f682c`；[Pages38501066427](https://github.com/sces5504/Solaria-Remaster/actions/runs/38501066427) check／113相關unit／format／build／4相關Chromium35.2秒與部署通過，無重試。不是完整browser套件。

線上：正式50檔／預覽50檔HTML、JS、CSS、PNG逐檔SHA符合各自建置（live-integrity.json／.log），正式根目錄保持main來源b2d3df3；線上刺客匯入舊目標／實際連續瞬移／匯出檢查血量與半徑、phase2通過20.2秒（live-boss.log），pageerror空。正式main、v1.1.2 annotated tag與兩archive refs已再次核對保持原值；PNG未改，不建立新正式tag或Release。部署後僅補文件與證據，遊戲程式同411c8a4。

後續等主人確認再正常整合main；不能依更早正式更新授權自動推main。可重點試玩刺客、浮空腦袋、蠕蟲與跳躍型Boss，以及狼王／巫醫／浮空腦袋落雷。保存已被舊版覆蓋的Boss生命不憑空回填，本修正防止後續位移再次覆蓋。
