# 剩餘驗收與恢復步驟

内容實作與自動程式回歸索引見RELEASE_CHECKLIST、五份矩陣與V1_ACCEPTANCE；本檔列尚未完成的S13硬體／人工要求，不代表須重新開發S00或已放棄需求。最新來源、正式部署、CI與舊檔結果以CURRENT_STATE最新首節及git log為準。

## 恢復

安全核對status／branch／remote／log，從遠端implement/s00-s05最新HEAD接續；保護工作、不reset／force／merge main、不改舊Solaria。先讀六記憶與九份正式文件末尾增量。Node24，沿用bash scripts/cloud-setup.sh；完整瀏覽器先build，期間不要重build改dist。cloud-setup已修為不依賴rg，須確認unit307實際執行而不是被略過。

源碼與數值未變時不要只為文件更新再重跑相同遊戲；以發布來源的完整CI及JS／素材SHA256對應證據、文件format核對為準。如修遊戲，重新check／unit／build／完整browser／format與Pages正式站核驗。

## 未完成項

1. 真GPU一般場景與600彈連續60秒：依TEST_PLAN硬體條件測FPS／P95，先記錄GPU與瀏覽器／設備，不接受SwiftShader或數學預算當硬體驗收。Cloud密集量測平均1.3–1.5秒／幀，60FPS為FAIL；真正GPU仍NOT_RUN。完整保存攻擊、特效、每傷獨立字，不能刪除有效內容偽造達標。
2. 真設備十次restart記憶體：正常UI開始、戰鬥、暫停、返回；記錄JS與GPU資源，不用現有Cloud後15次heap約0.155MiB範圍替代GPU記憶體。現有10＋30 Cloud回歸PASS其功能範圍。
3. 三職一般及強構築的自然30＋1完整旅程，首周目與1／2／5／10周目人工對照：不得預授卡、改王血、debug通關或把單王fixture當正常取得。保留死亡與卡／裝備／樓層／時間，確認40–60分鐘及各職基本可行性，再依授權調普通數值並記前後與回歸。現有bot到5–8房／路徑逾時不是完整通關；合法24王戰與8格擋比較仍有一般劍1／2周目死亡，不能確診為玩家無法通關，也不能稱已完整平衡。
4. Firefox與Safari：正常新局、同時普攻／職技、8:5、保存重載／舊檔、圖鑑、九地形／王與密集場景，按TEST_PLAN記PASS／FAIL／NOT_RUN。現有全部Chromium不代替其他引擎。
5. 人工音效聆聽與全部短FX逐幀確認：用CARD／BOSS／EQUIPMENT／EVENT矩陣逐項核對專屬造型、亮芯、前後動態及命中時序；Steam作品質參考而非共用水柱模板。波形、實際AI紀錄與場景截圖不代表全部短招式已人工批准。

若外部硬體仍不可用，保持NOT_RUN，不把功能PASS改寫成S06–S14全項驗收完成。修復與實測後增量更新PROJECT_STATUS／CURRENT_STATE（UTC）／MASTER及相關矩陣，保留歷史失敗。正式站工具：先SOLARIA_PAGES=1 npm run build，再執行tools/validation/pages.config.ts預設正式網址，核對JS／atlas／manifestSHA256、新局及53691bf原始IndexedDB繼續與再次保存。

Cloud線上工具：`NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt PLAYWRIGHT_BROWSERS_PATH=/tmp/solaria-browsers ./node_modules/.bin/playwright test --config docs/validation/tools/pages-cloud.config.ts`。執行環境需允許Chrome NSS資料庫`/home/agent/.pki/nssdb`寫入（實際HOME路徑依環境核對，不重設HOME）；只有read掛載可能造成ERR_CERT_AUTHORITY_INVALID。保持TLS驗證開啟與受管proxy；不要移除代理繞过policy。
