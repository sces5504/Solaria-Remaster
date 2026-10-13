# 1.3.2-preview.1 房型與裝飾擴充

第二步獨立測試，不包含在正式main 1.3.1。

- 九地形各12房名，共108；原54名稱／索引保留。
- 新增弧灣、階臺、雙島、扇陣、交織、岔門配方，按生態材料區別。
- 可走空地新增花草／碎石／雪與灰等純裝飾，無碰撞與傷害。
- 同名房型按種子作有界位置偏移與細節變化，列陣保持規律；存檔重載不換圖。
- 新局從12房型選4，舊旅程不重抽；Boss／地形分支流保持。

相關通行、108房型、同名變體、全部模板能抽中與保存30unit通過。初輪種子混合缺陷的7FAIL保留，修正後通過。完整unit／Chromium／部署與線上證據尚待。

本地完整438unit、10相關Chromium2.4分鐘、check／build／format通過；CI與預覽部署尚待。不把相關browser當完整套件。

## 1.3.2-preview.1 已可試玩，main保持1.3.1（2026-10-13）

試玩：https://sces5504.github.io/Solaria-Remaster/preview/terrain-1.3.0/?v=1.3.2-preview.1 。第二步遊戲来源362b6927555b82b601cf00a48c44bb31a8203eca，分支gameplay/v1.3.2-room-variety；Pages38400439784的check／438unit／format／build／10相關Chromium1.1分鐘／部署PASS，無flaky，不是完整browser套件。108具名配方、同名種子變體、雙尺度通路、12模板均可抽中、裝飾無碰撞与保存已測。前述7FAIL與修正紀錄保留。

正式50檔與1.3.1建置逐檔同SHA，預覽50檔與本地相同，共100檔核對；實際新局、手冊、解鎖／跳21與31、保存重載／重新鎖定、獨立DB与周目門檻PASS，pageerror空。證據docs/gameplay-1.3.2/results，九地形新房型實圖screenshots。正式main d38818eff1079f4fd42d619fa926741fce0a7f12／tag v1.3.1仍保持，第二步未推main，無新正式tag。新開局可抽新增房型；舊存檔既有journey與當前圖保留，下一房按原保存模板進行。

第一步1.3.1正式發布已完成，第二步預覽已交付，接主人試玩回饋。未開Chat／agent；原GPU／Firefox-Safari／三職自然完整與人工體驗未測界線保持；固定1.1.2refs／備份與旁支美術交接不改。
