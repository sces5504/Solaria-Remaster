# 手機雙輸入試玩

工作分支gameplay/mobile-preview，1.4.0-preview.1；正式main仍1.3.3 ea7b1a5，主人確認前不能整合、建立正式tag或Release。README由主人維護，不讀／比較／修改。本輪只更新CHANGELOG與相關交接；1.1.2 refs與固定下載不動，不開Chat／agent。

Command／固定步長／原核心保持。新增Input觸控狀態、TouchControls、MobilePlatform／MobileUI與純AutoAim；手機使用側邊操作列與完整8:5等比畫面。自動瞄準用20寬長方形SAT通道，排除牆／實體掩體，湖泊和毀壞障礙不擋彈；720搜尋、法師職技450×range既有上限、0.3秒鎖定／20%切換距離，立即丟棄失效目標。純座標送入原有招式，不自動出招或移動。鍵鼠切回手動瞄準。

觸控多指各自追蹤pointer id／capture，普攻滑出釋放；取消與lost capture、旋轉、blur、visibility／pagehide／bfcache清輸入、暫停。橫屏回來手動續；直屏gate與核心暫停雙重保護。全螢幕／orientation.lock失敗不擋遊戲，iOS加入主畫面只有短引導與相對scope的manifest，沒有離線PWA或強制滿屏承諾。使用者手勢才建立／恢復音效，背景suspend；靜音保持。

驗證進行中：31相關unit與build通過，三職Android Chromium與iPhone WebKit模擬的移動／連發／職技／閃避通過，Chromium原生四指capture與外接鍵鼠案例曾通過；完整三職升級／拾取／換裝／出口／重玩及旋轉音效流程補驗中。原始失敗不刪：型別錯誤、單元測試將普攻casts誤當職技、重複dialog listener、過關後讀隱藏按鈕座標、重玩未等非同步手冊、移動等待使用絕對時間，以及拿施法後已移動的敵人位置比較固定落點。後兩者改用核心相對時間與靜止驗收目標，不改遊戲規則。

WebKit主機無系統安裝權限，已將所需套件解壓至/tmp並用獨立wrapper提供函式庫；只模擬引擎，不稱Safari真機。CI預計以Ubuntu正常with-deps安裝；CI／預覽部署尚待，未提前標PASS。

未驗證：Android Chrome、iPhone Safari／Chrome真機；實際瀏海與系統手勢、真正App中斷、實體音效／效能、加入主畫面安裝及強制全螢幕／鎖向成功路徑。所有軟體模擬、DOM事件或CDP觸控結果與上述真機缺口分開。

本地收束：初輪31相關unit與最後8選敵unit補驗通過；Android三職戰鬥、全流程、選敵、原生四指／visibility與桌面鍵鼠已各項通過，WebKit三職戰鬥與三職全流程／選敵／方向保護已通過。不是同一輪完整套件，CI將以最終來源32unit及18相關瀏覽器案例再核對。軟體渲染初次弓箭手多次讀檔流程90秒timeout，僅補驗該項後通過；完整流程超時上限180秒，斷言不改。WebKit實測確診主畫面引導遮住手冊按鈕，修為僅主選單出現且預留空間，修正後全流程通過。手機暫停／背包／升級等靜態戰場只重繪變更，不在每個RAF重畫相同內容。

最後兩引擎生命週期補驗2PASS：包含音效suspend／手勢resume／靜音，以及未提供與Promise拒絕兩種全螢幕回退。CI／預覽仍待發布，真機界線不變。

主體790633e／Pages38515453830已成功：check、32相關unit、format、build、Android Chromium／iPhone WebKit／桌面18相關案例與部署通過。追加寬幅觸控全螢幕檢查，確診原桌面fullscreen sidebar規則在>1000px可能覆蓋手機隱藏，補高優先手機規則；兩側最低留白提升24px。新寬幅實際全螢幕本地1PASS。最後將只跑8選敵unit與4相關瀏覽器（寬幅全螢幕／兩引擎方向音效回退／桌面鍵鼠），不能把主體18項冒稱最後來源整輪。

CI畫面artifact下載服務回403，已保留去除簽名查詢參數的錯誤記錄，不繞過限制；最後以公開試玩頁自行擷取畫面核對。

## 試玩交付（2026-10-14 05:26:16 UTC）

[手機／電腦獨立試玩](https://sces5504.github.io/Solaria-Remaster/preview/mobile/?v=1.4.0-preview.1)，不推main。主體790633e的[CI38515453830](https://github.com/sces5504/Solaria-Remaster/actions/runs/38515453830) 32unit／18browser 3.7分鐘通過；最後30a07b0的[CI38516029619](https://github.com/sces5504/Solaria-Remaster/actions/runs/38516029619) check／8unit／format／build／4相關browser58.1秒／部署通過。無重試；主體與最後來源分開，沒有將兩輪18＋4標成最後完整22項。

公開頁100檔HTML／JS／CSS／PNG逐檔SHA一致（正式50＋試玩50），manifest HTTP200／standalone／相對start與scope通過。初次本地比對資料夾混有舊bundle導致404，保留live-integrity-stale-bundles.log；重建本任務暫存建置副本後通過live-integrity.json。真正載入手機頁的獨立DB名稱為solaria-remaster-playtest-mobile；同origin測試正式DB標記在重載手機頁後保持，live-isolation.json通過，沒有接觸玩家真存檔。

線上Android Chromium模擬：法師移動／普攻連發／職技／閃避／選敵24.6秒與CDP原生四指、滑出釋放、接鍵鼠、visibility中斷20.0秒，合計2項46.2秒通過，pageerror空。combat-target畫面與iPhone WebKit布局畫面已目檢，screenshots保存。這不是實體Android或iPhone，也不是三職自然完整31關／完整全瀏覽器測試。

正式main ea7b1a55e22342c6cb8fc6b08ed69cb9663ef60f、v1.1.2 tag／兩archive refs已核對不變。無新正式tag或Release、固定備份與PNG素材不改。後續先接主人手機試玩回饋，待明確確認才整合main；README由主人維護，不主動讀／比較／改動，版本歷程維護CHANGELOG。
