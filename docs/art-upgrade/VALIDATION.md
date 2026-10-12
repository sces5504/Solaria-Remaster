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
