# 美術選樣可維護來源

基準為fa08521的1.0.1實作；藝術樣本在art/style-lab保存。正式站新增public/art-review單檔的發布來源為0fec7c7，並未把這裡的Stage／Vite修改合併至正式遊戲。

三套各24格原創image_gen atlas、生成描述／manifest、僅供選樣的素材resolver、真實戰鬥fixture、獨立音效、三款並排、細節放大與單檔打包工具皆完整保存。展示入口與全遊戲素材重製不同；主人尚未選定風格。

PASS：check、326unit、完整85Chromium26.2分鐘（共享renderer版本；此前單檔四項亦PASS）。後續僅改善demo取樣接縫、場景識別與標題錨點，最終源碼build／format及四項demoChromium24.1秒再次PASS；最終單檔九張實際WebGL擷取、4Chromium48.3秒及發布工作樹4Chromium50.6秒PASS，未把不同版本的測試合成單輪。正式遊戲22JS／CSS／原素材SHA256一致。

完整85為Cloud功能回歸，包含原600彈／重啟功能，不是GPU60FPS或完整逐幀驗收。file://被管理政策阻擋，HTTP單檔可用且無外部素材請求。單姿態樣本沒有完整逐幀動畫；本輪沒有接受任何最終風格。

本分支可供後續維護demo與選定風格後取用原創素材，不應直接以merge替換正式美術。發布狀態與最新URL驗證看implement分支CURRENT_STATE與docs/art-lab/REVIEW。

重建單檔：`node tools/art-lab/standalone.mjs /workspace/art-delivery`。普通開發入口：`art-lab.html`；此入口新增Vite多entry。正式公開頁是獨立嵌入產物，保留官方bundle不變。
