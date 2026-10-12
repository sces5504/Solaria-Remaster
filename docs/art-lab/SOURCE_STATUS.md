# 美術選樣可維護來源

## 全遊戲採用精雕冒險像素（2026-10-12，本輪使用者明示）

使用者原話：「我最後決定使用：精雕冒險像素，就直接幫我把整個遊戲更新成這個畫面風格吧」。先三風格選樣、等待決定的限制已滿足，後續是全遊戲美術實作與公開遊玩站更新；本chat接續現有art分支／PR4，保留main與原作只讀、既有公開Pages方向。

四項要求：判斷並補齊火焰／熔岩／能量物的自發光與場景光源；增加微弱自然光、保留局部光影；絕大部分古老幾何FX改為符合新美術的繪製特效，蒸氣爆炸為品質基準；適當放大樹和柱。範圍、碰撞、預警、傷害時序及數值保持原規則。先前取消未來多人／連線計畫仍有效，Web託管不受影響。

全64角色／敵人：60類各ready／step／attack三張原創姿態，三職業與南瓜夥伴四類另繪六狀態，共204有效原創姿態。六引擎狀態、翻面、蓄力、跳躍、受擊表現均接入，不能說64類全部新增六張獨立姿態。九地形地面／四類場景物、事件地標、封印柱、武器、主選單與職業肖像重繪。新火／電／冰／水／秘法／爆炸／鬼影／符文FX，正確的危險幾何與既有蒸氣保留。

狀態：實作中，已check／build／format與327unit、初版九地形和三短FX實機PASS；完整98Chromium仍在執行。初版火山地面過亮且重複，已另繪低對比地面，最終地面補驗與發布尚待完成。真GPU60FPS、Firefox／Safari、人工聆聽與原S13驗收界線不冒稱PASS。

基準為fa08521的1.0.1實作；藝術樣本在art/style-lab保存。正式站新增public/art-review單檔的發布來源為0fec7c7，並未把這裡的Stage／Vite修改合併至正式遊戲。

三套各24格原創image_gen atlas、生成描述／manifest、僅供選樣的素材resolver、真實戰鬥fixture、獨立音效、三款並排、細節放大與單檔打包工具皆完整保存。展示入口與全遊戲素材重製不同；主人尚未選定風格。

PASS：check、326unit、完整85Chromium26.2分鐘（共享renderer版本；此前單檔四項亦PASS）。後續僅改善demo取樣接縫、場景識別與標題錨點，最終源碼build／format及四項demoChromium24.1秒再次PASS；最終單檔九張實際WebGL擷取、4Chromium48.3秒及發布工作樹4Chromium50.6秒PASS，未把不同版本的測試合成單輪。正式遊戲22JS／CSS／原素材SHA256一致。

完整85為Cloud功能回歸，包含原600彈／重啟功能，不是GPU60FPS或完整逐幀驗收。file://被管理政策阻擋，HTTP單檔可用且無外部素材請求。單姿態樣本沒有完整逐幀動畫；本輪沒有接受任何最終風格。

本分支可供後續維護demo與選定風格後取用原創素材，不應直接以merge替換正式美術。發布狀態與最新URL驗證看implement分支CURRENT_STATE與docs/art-lab/REVIEW。

重建單檔：`node tools/art-lab/standalone.mjs /workspace/art-delivery`。普通開發入口：`art-lab.html`；此入口新增Vite多entry。正式公開頁是獨立嵌入產物，保留官方bundle不變。

## 展示操作補正

維護來源71d5d16兩輪GitHub Development CI完整85Chromium均PASS（38217069707／38217279702）。後續只补正按钮焦點下1／2／3快捷鍵、並排進fullscreen先回單款、Canvas與HUD共同置中8:5與拒絕fullscreen的簡短回饋；最終獨立HTML五項ChromiumPASS27.1秒，新增fullscreen兩尺寸回歸，未把前一85當此新增第86項已全輪通過。正式新版入口發布來源d772980，部署狀態以implement分支CURRENT_STATE為準。

主人已取消未來多人連線／合作邀請房規劃，後續單人目標；來源分支從正式規格接續此新決定，保留現有單人核心／渲染／保存所需邊界。

## 1.1.0全遊戲精雕冒險像素已發布（線上核對：2026-10-12 12:01:35 UTC）

主人選定精雕冒險像素並要求直接更新全遊戲，現已交付正式[遊玩站](https://sces5504.github.io/Solaria-Remaster/?v=1.1.0)。PR4合併de37e6bc487f92799df19e453ee943423d6db55a，全屏測試相容修正後發布來源34406cce2660244d8999afd2593cc133ab22bfe6／implement。Pages38243697393成功，check／327unit／format／build／完整98Chromium16.0分鐘與deploy成功；同來源Development38243697400／38243702171亦成功。不force、不reset、不merge main，原作未動。

線上實機PASS：18PNG全部SHA256吻合、menu與持武器三肖像decode、真正WebGL／精雕冒險像素／147素材身份索引、8:5、D移動與普攻、tick推進、沒有請求舊四atlas、無pageerror；正常匯出current亦核對玩家移動x>113。全64身份／204有效姿態、九地形／事件／最終王、弱自然光與native火／熔岩／魔法受光、更強局部反射、大樹柱與遮擋淡出、多數繪製FX已使用。核心／数值／碰撞／存檔schema維持，舊旅程可接續；三款歷史演示仍保留。

確切來源／生成／manifest、全部失敗與修正、真正擷取與成功log見docs/art-upgrade。先前de37／4b各97PASS／1FAIL只因新版Chrome不准native fullscreen中改視窗；已退出→改尺寸→重新進全屏，同CI Chromium156五項PASS，未跳過或弱化8:5斷言。不要把旧「尚未選定」「正式遊戲仍原素材」當現況。原S13真GPU60FPS／跨瀏覽器／人工與自然30＋1未測界線仍保持，這是本輪美術交付，不冒稱全遊戲驗收全部完成。未來連線／合作計畫已取消，不加網路預留。
