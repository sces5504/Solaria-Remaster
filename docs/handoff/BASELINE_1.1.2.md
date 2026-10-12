# 1.1.2 固定備份與 main 接續

主人在2026-10-12明示：美術已完成定稿，後面不再動；先保存1.1.2不變備份，再將同一版整合到main，後續遊戲更新都放main。

## 固定原版

- 固定commit：`9abc6d8ce90bcde5ef292f0db6202dd38d993e05`。
- 標籤：[v1.1.2](https://github.com/sces5504/Solaria-Remaster/tree/v1.1.2)。這是annotated tag；解析其commit應得到上述SHA。
- 備份分支：[archive/v1.1.2](https://github.com/sces5504/Solaria-Remaster/tree/archive/v1.1.2)。不得提交、刪除、移動或作工作分支。
- 下載備份：[1.1.2 Release](https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.1.2)。Release頁面提供tag原始碼ZIP／TAR，以及固定commit保存的遊戲ZIP及SHA256檢核檔下載連結，禁止替換／覆寫。
- 原已發布程式來源：`7cff9de9ea3a1f0ace3aec735a1dfb3437158a74`，Pages38262913407；9abc只增加已驗證的結果文件，遊戲程式相同。

GitHub integration建立防修改ruleset的API回403 Resource not accessible by integration；沒有啟用平台防寫鎖，不把約定冒稱技術保護。固定content-addressed commit、標籤、下載副本與SHA256共同保留基準。只要refs維持，即可直接檢出；即使有人誤改refs，也可核對此固定SHA與下載副本。管理限制不妨礙保存、main接續及公開下載。

## 備份產物與可還原性

原CI github-pages artifact下載的雲端附件服務回403。採安全替代：從固定9abc來源與已鎖依賴作SOLARIA_PAGES=1 build。已實際核對重建包與當时正式1.1.2的index／art-lab HTML、所有JS／CSS bundle及20張精雕冒險PNG SHA256逐位元相同。沒有把重建檔稱作原CI下載包。

證據在results/v1.1.2-backup-integrity.json及.log。Release附件上傳服務401 Bad credentials，因此改以正常Git內容保存遊戲ZIP至獨立封存分支archive/v1.1.2-files，固定commit `0400546bc23cd7f3d176fa2f739ebfc705ba0ad2`，不改v1.1.2／archive/v1.1.2來源。下載遊戲ZIP：[固定檔案](https://raw.githubusercontent.com/sces5504/Solaria-Remaster/0400546bc23cd7f3d176fa2f739ebfc705ba0ad2/backups/Solaria-Remaster-v1.1.2-pages.zip)。其SHA256：`69fe09cfc5fb3b96e3cd4d2ea002b16cc1234a69516b7edd86c59d9d60ce68d5`。CHECKSUMS-v1.1.2.sha256同時列本地git archive原始碼ZIP指紋；GitHub自動ZIP壓縮metadata不同，不以此指紋驗自動ZIP，來源內容依固定tag核對。原始碼zip不含node_modules、機密或主人的IndexedDB；依package-lock可恢復依賴。Pages.zip內根目錄為Solaria-Remaster，可放在對應web路徑託管；不是雙擊file://保證可玩的離線程式。

## main 與後續規則

main原d97b219為本版來源祖先，無獨有提交；本次採一般fast-forward推進，沒有reset、force、丟棄main歷史或改原作。main保留完整1.1.2遊戲／素材，追加交接文件、美術定稿規則與Pages只接受main的push。來源與公開站仍1.1.2，不因文檔遷移增加遊戲版本。

後續從遠端最新main接續；可用自己的工作分支，最終合併main。implement與art分支只留歷史；不要再讓它們發布覆蓋main。不重畫素材、改風格、重排UI外觀或恢復舊幾何FX。機制需要的來源／資料同步與確診接口Bug可最小修正而保持外觀。

本次main來源的部署SHA、CI與線上核對結果完成後記在CURRENT_STATE首節及本檔末尾，不能只靠版本字樣當已發佈。

## 若日後需要回到這版

1. 保護工作，fetch最新main與v1.1.2，在新的rollback工作分支／worktree確認此固定SHA。
2. 根據原始碼／Pages下載副本核對欲恢復的程式與素材。以最新main為父提交還原遊戲檔案，保留最新main交接、固定備份及CI分支規則；不要整份覆蓋成舊「main尚未合併」文檔。
3. 正常提交到main並用相符驗證發布；保留以後的Git歷史，不把main force推回tag，不改備份refs。
4. 外部玩家存檔可能隨未來版本演進，回復前實際驗證當時的schema相容性；備份不是每個玩家存檔的副本。

## 已驗證與未驗證界線

原1.1.2有332unit、4相關Chromium、正式20PNG／WebGL輸入及RUN_END呈現fixturePASS；未將完整104browser或自然完整通關標PASS。真GPU、跨瀏覽器與人工S13缺口保持。main遷移只改文件／發布分支規則，不改遊戲與素材；核驗同版樹、格式及main部署的相關scope，無需重做美術或舊數值工作。

## main接續與1.1.2封存交接完成（2026-10-12 15:36:09 UTC）

主人新要求已完成：main由d97b219一般fast-forward至48265dc409f98d4a44015049bd72ab54b6740887，完整1.1.2遊戲／素材與v1.1.2固定來源逐檔相同，僅更新交接、定稿規則與Pages push只main。Pages38270610088在main成功：check／332unit／format／build／4相關browser2.4分鐘／deploy；2026-10-12T15:35:06.948Z線上HTML／全部JS-CSS／20PNG與封存版逐位元相同PASS，未改遊戲版本。此後只從遠端最新main接續，不能恢復implement正式整合或雙窗口美術分工。

固定tag v1.1.2／archive/v1.1.2維持9abc6d8ce90bcde5ef292f0db6202dd38d993e05；遊戲下載封存archive/v1.1.2-files固定0400546bc23cd7f3d176fa2f739ebfc705ba0ad2，ZIP SHA256 69fe09cfc5fb3b96e3cd4d2ea002b16cc1234a69516b7edd86c59d9d60ce68d5，下載HTTP200。Release已公開https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.1.2，列tag自動來源下載與固定遊戲ZIP連結。ruleset403／Release附件上傳401，未啟用平台防寫鎖／未稱附件已上傳；以固定Git內容／下載與禁止變更規則保存。主美術工作結束，後續只改非美術機制、數值與Bug，最小接口修正維持外觀。

完整新prompt：docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md；備份／回復：BASELINE_1.1.2.md；短貼用入口：docs/handoff/README.md。主人原1.0.1 prompt完整保留於archive/GAMEPLAY_PROMPT_PRE_ART_1.0.1.txt，不以其舊main／多人／雙窗口規則覆蓋最新要求。證據docs/handoff/results。原GPU、自然全流程等未測界線維持，沒有把同版發布当新平衡驗收；未spawn agent／new chat。
