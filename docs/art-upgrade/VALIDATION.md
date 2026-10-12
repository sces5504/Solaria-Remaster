# 精雕冒險像素 1.1.0 核驗

正式發布尚待最終checks與URL核對，不能將下列較早來源的PASS當成已上線。

- 全64身份素材接入；60類三姿態、三職業／南瓜四類六姿態，共204有效原創姿態。九地形地面與障礙、事件地標／召喚物、索拉里斯封印柱、持武器肖像／獨立瞄準武器及主選單重繪。
- native熔甲獸即使元素null也發光、熔池／熱孔／能量身體、burn／stun／招式／魔法敵彈與物品共同受光。自然遮光.20–.38→.08–.20，較弱自然暗部配更強局部反射；64燈預算不删彈或攻擊。
- 大樹96×120起、柱68×108起，每個碰撞障礙對應一個完整物件；遮住角色／敵人的樹冠半透明。核心碰撞矩形、耐久20／boss5／mob4、技能數值／預警／傷害時序未改。
- 六階段繪製爆炸、火舌／電漿／冰水／秘法彈、燃燒／命中／符文／鬼影／盾與斬擊代替多數簡單幾何FX。保留原Steam三波與精確預警／雷射邊界，藍雷分支仍為白芯藍光。

## 真實失敗與修正

初版check失敗是新test把Run當actor第一個數字id；造成循環JSON的同一fixture亦令一unit FAIL，改正fixture後327unit PASS，沒改核心。初版FX測試讀HUD之後未等首RAF，取得空names；改等實際素材繪製。

首輪完整98：95PASS／3FAIL、23.2分鐘。journal仍攔舊boss-atlas因此沒產生資源失敗；改攔正式使用的heroes.png，仍核對重試與既有存檔。resonance仍指定twilight.svg；改新menu.png並增加三張持武器肖像真正decode／128px核對。局部藍雷亮度在自然光調亮後未達原15%差；加強局部bloom／範圍，保留原1.15斷言未降低。三項修正後3PASS43.4秒。

九地形初版實機PASS，但看圖發現火山裂紋／星界晶石搶眼；另繪安靜ground／alternate，後續九地形＋三FX12PASS2.2分鐘。hero六姿態避免原death狀態仍像攻擊，並用image_gen移除重複武器，保留独立瞄準與持武器選角肖像。

FX原圖紫色orb光暈跨進爆炸格、初期shot還可能錯過短FX；image_gen修整／中性爆炸底與明確frame windows，按原核心觸發後用正常Esc暫停擷取，恢復後驗證到期清除。一次burn剛進戰鬥太早Esc尚在交易鎖；補等真實overlay hidden，不跳tick／改核心。最後三FX3PASS50秒，紫色色塊已消失，blue／theme tint一致。

最終全98回歸目前在跑；結果及發布URL驗證隨完成增量補入。真GPU60FPS、Firefox／Safari、人工聆聽、自然三職30＋1全程與歷史S13剩餘未測不能寫PASS；這次是美術交付核驗，不取代舊驗收矩陣。

## 本地最終結果

完整98Chromium全PASS23.8分鐘。其後只補元素材質輪替／敵方元素與主題、猩紅眼魔自發光色；最終build與327unit再次PASS，實際production bundle19Chromium3.4分鐘PASS，包含九地形、三短FX、光影15%原門檻、Steam／火扇／藍雷、選角背景、選卡保存、冰凍／電暈與素材底框。PNG保存gallery，完整早期失敗／後續成功log保存results。

正式exact commit的CI與Pages核對待完成；不冒稱已部署。

## Chromium原生fullscreen測試相容修正（2026-10-12 11:33:26 UTC）

PR4已合併正式implement，來源de37e6bc487f92799df19e453ee943423d6db55a；自動Pages未觸發，明確啟動既有workflow_dispatch38239732607。該輪check／327unit／format／build通過，98browser為97PASS／1FAIL14.7分鐘；部署job跳過，未發布新版。失敗只在歷史演示的第五個fullscreen案例：新版Chromium156不允許native fullscreen狀態下setViewportSize。改測試為exitFullscreen並等恢復→調整正常視窗尺寸→重進fullscreen，保留兩尺寸、真canvas8:5、並排回單款與快捷鍵全部斷言，不跳過或減少coverage。

Cloud下載同CI的Playwright Chromium156到workspace cache（不關TLS、不使用file://），五項演示production browser5PASS24.1秒，check／build／format核對。素材與正式遊戲程式未更改；重新發布完整checks待完成。Source4b的兩輪Development失敗亦保留核對，沒有選成功輪掩蓋。

## 1.1.0全遊戲精雕冒險像素已發布（線上核對：2026-10-12 12:01:35 UTC）

主人選定精雕冒險像素並要求直接更新全遊戲，現已交付正式[遊玩站](https://sces5504.github.io/Solaria-Remaster/?v=1.1.0)。PR4合併de37e6bc487f92799df19e453ee943423d6db55a，全屏測試相容修正後發布來源34406cce2660244d8999afd2593cc133ab22bfe6／implement。Pages38243697393成功，check／327unit／format／build／完整98Chromium16.0分鐘與deploy成功；同來源Development38243697400／38243702171亦成功。不force、不reset、不merge main，原作未動。

線上實機PASS：18PNG全部SHA256吻合、menu與持武器三肖像decode、真正WebGL／精雕冒險像素／147素材身份索引、8:5、D移動與普攻、tick推進、沒有請求舊四atlas、無pageerror；正常匯出current亦核對玩家移動x>113。全64身份／204有效姿態、九地形／事件／最終王、弱自然光與native火／熔岩／魔法受光、更強局部反射、大樹柱與遮擋淡出、多數繪製FX已使用。核心／数值／碰撞／存檔schema維持，舊旅程可接續；三款歷史演示仍保留。

確切來源／生成／manifest、全部失敗與修正、真正擷取與成功log見docs/art-upgrade。先前de37／4b各97PASS／1FAIL只因新版Chrome不准native fullscreen中改視窗；已退出→改尺寸→重新進全屏，同CI Chromium156五項PASS，未跳過或弱化8:5斷言。不要把旧「尚未選定」「正式遊戲仍原素材」當現況。原S13真GPU60FPS／跨瀏覽器／人工與自然30＋1未測界線仍保持，這是本輪美術交付，不冒稱全遊戲驗收全部完成。未來連線／合作計畫已取消，不加網路預留。
