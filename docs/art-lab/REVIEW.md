# Solaria 像素美術三風格選樣

本輪主人要求取代先前「維持已接受方向、不重畫全遊戲」的美術邊界：先製作三個更精緻、跨地形一致的像素方向，以實機展示比較；主人選定後才繪製全遊戲。本輪沒有選定或接受最終方向，也沒有完成全素材／逐幀動畫。

獨立入口：[美術演示](https://sces5504.github.io/Solaria-Remaster/art-review/)。部署狀態以 CURRENT_STATE 最新首節為準；本檔先保存預定入口，不把網址存在當已發布。

## 使用方式

- 上方 01／02／03 切換精雕冒險、暗黑哥德、立體精緻像素；鍵盤 1／2／3 亦可切換。
- 預設暫停，播放演示／P 執行真實核心 AI 與攻擊；切換風格不重置目前戰鬥時間、座標與生命。
- 右欄選草原、火山、魔王城；八普通怪、六 Boss 與 Boss 兩階段，可單獨顯示或組合展示。
- 三款並排截取同一 tick 的 WebGL 畫面，點任一款回到單款展示。細節放大以 nearest sampling 展示同一素材三版本。
- 自己操作模式使用 WASD、左鍵普攻、右鍵職技、Space 閃避、Esc 暫停。旅人可選基礎行星爆、蒸氣、水火融合或雷电彈。
- 展示局會在死亡、清關、升級或 24 秒後重播，方便重複看動態；不是正常旅程平衡或自然通關驗收。

## 隔離發布

主人在本 chat 明確批准「允許發布獨立演示頁」。GitHub 連線拒絕 createRepository，不能另建演示站；依新授權採用現有 Pages 的 public/art-review/index.html。

入口為內含全部程式與素材的單檔 HTML，只新增獨立頁，不合併 art/style-lab 的 renderer／Vite 修改到正式遊戲。正式 src、原 atlas、玩法、存檔、索拉里斯與 Pages 工作流程保持不變。音效使用獨立、不持久化 mixer；不建立 IndexedDB 或改 solaria-volume／solaria-last-volume。

可維護來源保存在 art/style-lab 分支，起點 fa08521b7a396166823d93d482127daec683885e；不是 main 或舊骨架。原創 image_gen 樣本、格位、生成描述、SHA256 與單檔打包工具皆在該分支。正式頁旁 source.json 保存入口 SHA256、來源基準與素材 SHA256。未選風格前勿把樣本取代全遊戲美術。

## 實測界線

單檔最終版本四項 Chromium 驗證：同 tick 三風格與並排／放大、三地形八怪六王兩階段、真實手動移動／攻擊／暫停且不污染存檔與音量、三尺寸8:5／無橫向溢出，PASS。額外捕捉三地形 × 三風格實際核心運行到2.4秒後的 WebGL 畫面；單檔啟動只有 document 與本地 blob／data 請求，沒有外部素材請求。326 unit、型別及 build 的狀態以本輪記錄為準。

系統 Chromium 直接 file:// 導航被管理政策阻擋，測試以 Cloud HTTP 提供同一單檔；未繞過該政策，也不把 file:// 相容性寫 PASS。PNG 為單姿態樣本；完整逐幀跑步、攻擊與九地形全素材 NOT_RUN／NOT_PRODUCED。真 GPU FPS、Firefox／Safari、聆聽與原全局 S13 人工驗收界線保持。

## 發布前來源核對

PASS：發佈工作樹check、326unit（maxWorkers=2）、build、format、最終單檔4Chromium。額外SOLARIA_PAGES=1建置後，比較1.0.1已發布的22個JS／CSS／原素材SHA256全相同；只新增art-review頁。驗證檔案在docs/validation/results/art-review。

保留失敗：同時跑完整WebGL回歸時，兩次額外unit重跑各325PASS／1個5000seed掉落抽樣逾5秒。暫停背景瀏覽器測試、保持規則和斷言不變後，326unit全部PASS11.22秒；未加寬timeout或改掉落程式。源碼藝術分支較早整輪瀏覽器仍在執行，不把其未完結果寫PASS。

獨立入口標題改用頁內錨點，避免點擊後跳到僅在開發入口存在的art-lab.html。首輪Pages發布e37348e已在部署前取消，改發布修正後入口；不把取消流程寫成測試失敗或成功發布。

## 展示操作補正與單人規劃

主人已取消未來多人連線／合作計畫。既有桌面單人、Web託管與本演示維持。展示補正讓風格按鈕焦點下1／2／3仍可用、並排進全螢幕回到單款、實際canvas與HUD共同8:5置中，並處理瀏覽器拒絕fullscreen。最終單檔五項ChromiumPASS27.1秒。此前上線0fec版本線上4ChromiumPASS32.1秒與入口SHA256／原遊戲主選單核驗PASS；13MB導航response被CDP快取逐出導致首次雜湊讀取失敗，改用同一受管proxy的APIRequestContext讀取完整HTTP body後PASS，沒有忽略TLS。新版發布後再核驗五項與SHA256。
