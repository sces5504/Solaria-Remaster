# 正式1.3.2 本輪修正

主人要求本輪完成後發布main，包含原108房型預覽與本輪三個美術Bug、五項戰鬥／測試功能、22張卡片更新。數值與代價權威見GAME_SPEC最後1.3.2章；不重做已完成的房型與Boss彈幕改版。

本地449unit通過；最後未知Boss原點限制、既有gift-impact素材補接與死亡來源補驗52unit通過，CI將核對同一最終來源。第一輪舊規格13FAIL、追加fixture6FAIL與1FAIL、初輪瀏覽器對話重複／漏計武器貼圖2FAIL全部保留results，修正後5相關Chromium1.5分鐘通過；最終gift-impact／舊賭徒存檔4相关Chromium補驗中。畫面確認聖誕頭帽完整與火山柱無雪殘片，原PNG不改。

CI／main發布／Release／線上SHA與實際流程尚待，不提前標PASS；不是完整browser或真GPU／跨瀏覽器／三職自然流程測試。

最終本地4相關Chromium1分鐘與format／build通過；既有gift-impact像素素材實圖已核對，不再通用爆炸／符紋混疊。

首次正式線上SHA核對完成，但驗證腳本跳21後未等保存就刷新，讀回第1房而FAIL，紀錄live-before-save.log。補等待保存，也補測試裝備／跳關按鈕保存中禁用，避免快速操作被忽略；此修正將另核對最終發布來源。
