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

## 1.4.0-preview.2：手機戰場與選單調整中

本輪依手機試玩回饋改為半透明操作覆蓋，戰場保持8:5等比與完整世界；844×390下畫布由約458×286增加至544×340（寬高約增加19%，面積約41%）。主選單雙欄，手冊四欄，三選一卡片及底部操作縮整，保留內容與觸控按鈕尺寸。保留清楚的文字及圖示，不為過舊的小螢幕另作壓縮布局。

新增三種主流橫屏可用尺寸844×390／780×360／932×430的選單尺寸檢查，涵蓋主選單、手冊、選職業、房間提示與長說明三選一；保留8:5、至少80%可用高度、安全邊距與半透明斷言。舊全流程「按鍵必須在畫布外」斷言依主人新要求改為安全邊距，不再強制保留側欄。

初次測試存檔誤用劍士卡給法師，遭現有資料驗證拒絕，修正為法師卡54；隨後找到三選一844與667下的實際超高，調整底部並排及窄屏圖示位置。原始失敗保留results/layout-preview-2。相關驗證與預覽部署進行中，不先標PASS。真機尚未驗證、main保持1.3.3、README由主人維護等界線維持。

主人後續明示只照顧主流手機，不必為很舊或很小的手機改變布局。已移除本輪568×320專用的縮字／藏標籤／角落小圖示等分支，停止舊小尺寸驗收；改用上述三種主流尺寸。先前小尺寸失敗日誌保留作歷史，不列作目前支援目標，最終來源與結果另記。

主流尺寸補驗：3514658的本地7個相關案例中5通過，780×360的三選一在Chromium／WebKit各超出15px，因此主動取消尚未部署的CI38519777573，正式頁與既有試玩頁不動。量測定位為卡片插圖及段落margin；全手機統一縮小圖示及留白，維持12px正文與44px操作，不新增舊小尺寸分支。中間量測仍有3px溢出，修正較高優先權的既有段落樣式；原始日誌保留。最後只補驗780×360，再由CI檢查三種主流尺寸與桌面，不重跑完整遊戲套件。

## 1.4.0-preview.2 已交付（2026-10-14 UTC）

[開啟手機試玩](https://sces5504.github.io/Solaria-Remaster/preview/mobile/?v=1.4.0-preview.2)。最終遊戲來源5ba92199a1341ddaa997f4a384590a714734fdf3，[CI38520287887](https://github.com/sces5504/Solaria-Remaster/actions/runs/38520287887)的check／8相關unit／format／build／7相關browser（5個不適用project跳過，1.7分鐘）與部署通過，無重試。六項手機案例是Chromium及WebKit各測844×390、780×360、932×430，涵蓋主選單、手冊、選職業、房間提示與長說明三選一；第七項是桌面原鍵鼠。這是主流尺寸模擬，沒有為舊小手機另設布局。三職完整流程／全31關與全部瀏覽器套件本輪未重跑。先前控制層相關5項通過屬較早樣式來源，與最終CI結果分開。

正式50檔及手機試玩50檔HTML／JS／CSS／PNG逐檔SHA符合各自來源，manifest保持standalone與相對scope/start。公開頁Android Chromium模擬844×390再驗主要選單、三選一與放大戰場1項44.7秒通過；final-live截圖已目檢，正文與完整卡片說明保留，按鍵半透明。證據在results/layout-preview-2。正式main仍ea7b1a55e22342c6cb8fc6b08ed69cb9663ef60f，1.1.2 tag／兩archive refs不變；無新正式tag或Release。手機存檔命名空間及遊戲核心未改，本輪不重做已完成的隔離驗證。README未讀／比較／修改。

待主人試玩確認，仍不推main。Android Chrome／iPhone Safari與Chrome真機、硬體聲音／效能／瀏海與系統手勢仍未驗證；軟體模擬結果不能冒稱真機PASS。

## 1.4.0-preview.3 手機操作與佈局（試玩部署中，不推main）

手機背包／圖鑑／手冊／構築頂部返回取代音效，仍依入口接戰場或選單；首次手冊接職業流程保留。背包移除匯出（暫停仍可匯出），「目前構築」放在背包標題右邊，戰場移除構築與拾取／出口按鈕。

新增獨立mobile-layout編輯器與安全讀取，偏好存於storageKey(solaria-touch-layout)，不進run或存檔匯出；可拖曳／滑桿調整完整戰場55–100%、各按鍵60–160%及位置，一鍵預設，安全邊距／44px下限保持。編輯核心暫停，結束／中斷保存，旋轉不帶入卡住輸入。mobile-interaction由畫布實際座標點中具體物件，再透過可選Command.interactTarget執行；裝備與門重疊按距離選，仍守64拾取／滿包與已清關近門規則，桌面E原優先保持。技能／閃避有遮罩＋底部恢復進度並保留秒數與封印文字。

手機整頁pan-y限制縮放與選取，canvas／按鍵none，Safari gesture與多指touchmove防護；長選單保留單指垂直捲動。Android CDP確認畫布外雙擊及多指前後visualViewport scale保持、圖鑑內層原生單指捲動；WebKit只驗事件取消與點擊後scale及可捲動DOM，不視為iPhone實機手勢驗收。外接鍵鼠與旋轉／中斷仍由相關案例驗證。

本地14相關unit與1既有拾取unit通過；Android三個新操作／佈局／844選單案例通過，縮放／原生捲動補驗1項31.4秒通過；最終WebKit四項39.6秒通過。來源與輪次分開，不把這些相加當成最終同輪全套。CI預計以14unit及12相關Chromium／WebKit／桌面案例驗證與部署，未完成不先標PASS。

失敗原始日誌保留controls-preview-3：拾取後未等保存就開背包的測試；CSS grid-area讓絕對定位的安全邊距被重算，造成畫布越界／門被技能鍵擋住（已修為auto）；測試等待RAF的void型別；原生捲動讀錯外層panel，改讀實際catalog內層。初輪廣範測試在定位問題確診後主動停止，不能說完成21項。上輪交付後新增的ci-summary JSON補格式修正，內容保持，root README未讀／比較／修改。只照顧主流手機，不做舊小屏特殊布局。真機、硬體音效／效能／瀏海與系統手勢仍未驗證。

主體1742a7e／CI38527430379的check／14unit／format／build通過，12相關browser中11通過、iPhone首局流程1失敗（9個不適用project跳過，1.8分鐘），因此未部署。失敗是新頂部按鈕文字在下一RAF更新，測試以count立即判斷而略過手冊「選擇旅人」，不是實際拒絕選職業；改為等待tutorial/classes狀態、若tutorial則等待並點該按鈕，不放寬原斷言，不改遊戲程式。另同一遊戲來源Android成功進入全螢幕，完整8:5與按鍵安全邊距補驗1項21.0秒通過；不混充最後CI整輪。後續CI與線上部署仍待，原失敗記錄保留。

## 1.4.0-preview.3 已交付（2026-10-14）

[手機試玩版](https://sces5504.github.io/Solaria-Remaster/preview/mobile/?v=1.4.0-preview.3)，等待主人確認，不推main。主體遊戲程式1742a7e713d511ad80d87ff6d303a24d2fb6ded8；最後修正測試等待條件的部署來源e7ad20bcba9ee1e9a6d6dc38a41537573842fb60，兩者遊戲程式相同。[CI38527993760](https://github.com/sces5504/Solaria-Remaster/actions/runs/38527993760) check／14相關unit／format／build／12相關browser（9個不適用project跳過，1.6分鐘）與部署通過，沒有重試。涵蓋Android Chromium／iPhone WebKit的頂部返回、指定裝備與門、主流844橫屏、佈局拖曳／大小／位置／保存／預設／核心暫停、冷卻視覺、觸控縮放保護，以及旋轉／中斷／音效回復；另有Android原生四指／接鍵鼠與桌面原控制。不是完整browser套件或三職自然31關。

公開頁Android Chromium模擬再跑兩項：頂部返回／構築／點裝備與門35.6秒，以及佈局保存／還原／多指與冷卻47.2秒，合計1.4分鐘通過。final-live的背包標題旁「目前構築」／頂部返回、編輯器及技能就緒畫面已目檢；webkit-screenshots/cooldown.png另記錄冷卻遮罩與秒數。正式50檔與手機試玩50檔HTML／JS／CSS／PNG逐檔SHA符合各自來源，manifest相對start/scope與standalone保持。正式main仍ea7b1a55e22342c6cb8fc6b08ed69cb9663ef60f，v1.1.2 tag及兩archive refs核對不變；無新正式tag／Release，固定備份與PNG素材不動。

Android原生多指縮放／雙擊及內層清單單指捲動是Chromium軟體模擬；WebKit檢查事件取消／點擊後scale及DOM可捲動，**不是iPhone硬體Safari／Chrome手勢驗收**。Android Chrome／iPhone Safari與Chrome真機、硬體聲音／效能、瀏海／系統手勢仍未驗證，不能承諾擋住作業系統或使用者強制縮放。相關失敗與最終證據在results/controls-preview-3；不開Chat／agent，不讀／比較／修改root README。下一步接主人試玩回饋，仍須確認才整合main。
