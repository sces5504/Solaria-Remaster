# 1.1.2 視線、貼圖與勝利呈現

主人要求：繼續清理怪物／障礙殘片；事件中央2秒提示再淡出並附短句；光環時主角置前；索拉里斯勝利動畫配字接感謝字幕；敵彈與各地形背景明確區別；只做相關驗證。

- 上輪只清理actors且以bounding box估距，包圍盒空角與props鄰格碎片仍殘留。本次改實際本體像素三像素鄰近，保留近身分離武器及柔邊；八張怪物atlas＋兩張props atlas載入時逐格清理，地面tile不套遮罩。沙柱／火山岩及砂地施法怪單格與實際舞台均檢查，並非把整個本體裁小。
- 六事件有各自名稱及一句情境短句，在首次進入該事件戰鬥時顯示2秒，0.8秒淡出；不攔截滑鼠，不暫停戰鬥，同房後续波次不重播。
- 跟隨主角的圓形光環啟用時，真實主角sprite及持武器層移到friendly FX之前；敵方危險幾何、敵彈對比輪廓與hostile sprite仍在其上。光環結束恢復正常Y排序，不複製角色、不改碰撞。
- 敵彈保留元素原色，用深色底輪廓＋淡白細邊突出，對沙地、熔岩、雪地皆可辨；只改視覺，不放大判定。
- RUN_END播6秒日蝕消散／日光重臨的原創像素全景與三段配字，再16秒自動捲動感謝字幕。之後保留原下一周目、完成本局、匯出構築；可直接略過動畫與字幕。只UI計時，不推進核心時鐘；下一周目重新初始化。reduced-motion提供静止画面／可捲動字幕。

## 驗證與來源

TypeScript／production build通過。本地四項相關Chromium PASS2.0分鐘：六事件提示與正常輸入，三地形光環／敵彈，兩地形殘片，勝利動畫→字幕→正常下一周目與略過。首項fixture最初少填maxDurability，型別檢查攔下；補齊後只補驗殘片項PASS13.7秒，確認障礙本體正常可見，不以只剩地板碎屑的首張snapshot作交付。新輪廓回歸unit PASS，連同既有四項呈現unit PASS。來源未更動戰鬥核心、存檔schema、數值、時序。格式發現1.1.1的已保存JSON log未格式化，針對該artifact補正。

Ending PNG為image_gen原創精雕冒險像素，三職業背影在神殿望向重臨日光與九地形；無新增世界觀設定。source-atlases/ending.png與public/assets/adventure/ending.png保留來源，CC0與SHA256在manifest。證據見gallery及results。

Pages新增visibility-feedback scope，只跑這四項browser，既有type／unit／format／build維持。預設full及前次art-feedback scope維持。发布後再補CI與線上核對，不提前標已發布。
