# 1.1.2 封存遊戲檔

此封存分支在固定1.1.2原始碼9abc6d8上增加下載用Pages.zip，不改遊戲與美術來源。不得往此分支繼續提交、移動或覆蓋下載檔；後續更新只在main。

Pages.zip從固定來源重建，已與原正式1.1.2的HTML、全JS/CSS與20美術PNG逐位元核對相同。ZIP內Solaria-Remaster目錄需以HTTP在對應路徑託管。checksum檔亦列本地git archive原始碼ZIP的指紋；GitHub自動產生的tag原始碼ZIP因根目錄／壓縮metadata不同，不應以該ZIP指紋驗它，但內容仍可核對固定commit。

Release附件上傳受到uploads.github.com 401限制，故此檔用正常Git內容保存。來源標籤v1.1.2與archive/v1.1.2依然維持9abc6d8，不受此新增封存檔影響。
