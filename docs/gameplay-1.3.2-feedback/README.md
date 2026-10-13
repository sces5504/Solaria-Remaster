# 正式1.3.2 本輪修正

主人要求本輪完成後發布main，包含原108房型預覽與本輪三個美術Bug、五項戰鬥／測試功能、22張卡片更新。數值與代價權威見GAME_SPEC最後1.3.2章；不重做已完成的房型與Boss彈幕改版。

本地449unit通過；最後未知Boss原點限制、既有gift-impact素材補接與死亡來源補驗52unit通過，CI將核對同一最終來源。第一輪舊規格13FAIL、追加fixture6FAIL與1FAIL、初輪瀏覽器對話重複／漏計武器貼圖2FAIL全部保留results，修正後5相關Chromium1.5分鐘通過；最終gift-impact／舊賭徒存檔4相关Chromium補驗中。畫面確認聖誕頭帽完整與火山柱無雪殘片，原PNG不改。

CI／main發布／Release／線上SHA與實際流程尚待，不提前標PASS；不是完整browser或真GPU／跨瀏覽器／三職自然流程測試。

最終本地4相關Chromium1分鐘與format／build通過；既有gift-impact像素素材實圖已核對，不再通用爆炸／符紋混疊。

首次正式線上SHA核對完成，但驗證腳本跳21後未等保存就刷新，讀回第1房而FAIL，紀錄live-before-save.log。補等待保存，也補測試裝備／跳關按鈕保存中禁用，避免快速操作被忽略；此修正將另核對最終發布來源。

## 1.3.2 已正式發布與核驗（2026-10-13 15:17:13 UTC）

遊玩：https://sces5504.github.io/Solaria-Remaster/?v=1.3.2 。固定annotated tag v1.3.2／最終遊戲来源1603d7127ca829f741b166942aed1f8a28f27be5，Release https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.3.2 。main已正常整合108房型与本輪全部Bug／戰鬥／22卡更新，舊「房型只留預覽」限制已由本輪主人發布授權取代；下一步接新回饋，不重做已完成內容。

主體a64ef2d／Pages38418671613的check／450unit／format／build／6相關Chromium1.3分鐘／部署PASS；後補保存中禁用測試装備与跳關按鈕，最終1603d71／Pages38419778586的check／450unit／format／build／2保存相關Chromium18.4秒／部署PASS，無flaky。兩來源分開記錄，不把6項冒稱最終整套。原449unit與52最后邊界unit、4最終素材Chromium、2保存按鈕補驗及所有失敗原始紀錄都在docs/gameplay-1.3.2-feedback/results；不是完整browser／真GPU／跨瀏覽器／自然三職全流程驗證。

最終正式50檔HTML／JS／CSS／PNG與本地Pages建置逐檔同SHA，實際新局手冊／嚴格密碼／跳21與31／等待保存後重載／取得霜鈴并匯出／正式DB与周目門檻PASS，pageerror空。首次線上腳本未等保存就刷新讀回第1房FAIL保留live-before-save.log，修正等待後live-final.log與live-integrity.json通過。聖誕頭帽、火山柱與既有gift-impact像素禮物爆裂實圖screenshots已核對。20原素材PNG不改，v1.1.2 tag／兩archive refs核對不變，固定備份下载與旁支美術交接不動。未開Chat／agent，不reset／force push。

最新規則看GAME_SPEC最後1.3.2章：閃避2秒、反擊雙乘區、Boss掩體資格220×range近旁圓或底長220×range圖示三角形（仍實際命中），近戰10與波次保護保持。紅卡：79當前HP硬限40%，81承傷加倍不減maxHP，82技能+.6並扣血觸發受傷能力，84禁閃避，85取得先全卸／同時一件且可卸後換欄，不永久鎖欄；舊賭徒選欄存檔可接續。
