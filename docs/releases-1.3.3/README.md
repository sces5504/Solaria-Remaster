# 1.3.3 正式整合與下載版

主人已確認Boss預覽，授權推main、重寫README、整理版本歷程並提供直接雙擊遊玩的Release檔案。README完成後交回主人，後續更新僅維護CHANGELOG，不主動讀取、比較或修改README。

遊戲來源沿用已驗證411c8a4：生命曲線、曝光、死亡保護、Boss位移及落雷+0.5秒。新增打包腳本只在下載版建置時將同源素材嵌入、合併JS與CSS，正式網頁版程式／素材保持。沒有伺服器、啟動器安裝或額外執行環境需求。

本地下載版實際file://封鎖HTTP／HTTPS後，可啟動、顯示三職肖像、進戰鬥、移動、保存重載、匯出；Boss舊目標匯入與連續瞬移血量保持通過。第一次啟動測試誤用開始按鈕名而timeout；第二輪讀不存在診斷座標而1FAIL／1PASS，改以真正匯出保存的座標斷言後單項1PASS，原始log保留。只測相關範圍，不冒稱Windows／macOS真設備或跨瀏覽器實測。

Pages正式CI與Release採release-feedback：113相關unit、4現有相關Chromium、2下載版Chromium，僅在成功部署後發布annotated tag與實測同一HTML／SHA附件。此CI尚待，不能提前標PASS。既有v1.1.2 tag／兩archive與備份檔不改。

## 正式發布核驗（2026-10-14 04:13:00 UTC）

遊戲與annotated tag v1.3.3來源 `aac24fb3d2f8567af06eb30cbafc070e954d6a47`，tag物件c98a2a61acdb32ffc96283849c978bda58376254。[Release](https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.3.3)已附HTML與SHA256SUMS。Pages38509818835全部成功：113相關unit、4網頁Chromium1.1分鐘、2下載版Chromium25.3秒、check／format／build／部署／Release。ci.log保留，無重試，未重跑完整套件。

正式50檔逐一SHA符合本地Pages建置（live-integrity.json），正式網址刺客舊目標／雙瞬移／匯出血量與半徑14.3秒通過、pageerror空（live-boss.log）。Release公開下載35,953,088 bytes，SHA `c92defa8ca2e02d67157015ac84afe58d3c75146ea9a17937d014735ba49e0eb`，與本地實際file://離線驗證HTML完全相同，download-integrity.json及download-checksum.log證明。不是線上跳轉捷徑，包含同源程式／素材／音效；無須解壓或本機伺服器。

1.1.2 tag／兩archive refs再次比對固定值，PNG與備份不改。正式遊戲 https://sces5504.github.io/Solaria-Remaster/ 。發布後只補結果文件，遊戲程式同aac24fb。README交回主人；後續更新只維護CHANGELOG，不主動讀／比較／修改README。
