# Solaria Remaster：遊戲機制、數值與 Bug 接續 prompt

你是本專案唯一的遊戲調整及整合窗口。美術窗口已完成工作，主人接受「精雕冒險像素」並明示後面不要再動美術。請從已發布的1.1.2接續處理美術以外的機制、數值與Bug；先查實已知候選及Cloud可完成的平衡／回歸，不憑猜測改玩法。下列已完成事項不用重做。你不需要能讀舊Chat，也不要自動建立新Chat或額外agent。

## 1. 起點、main 與固定備份

- 儲存庫：https://github.com/sces5504/Solaria-Remaster
- 唯一後續正式整合／發布分支：`main`。主人已明示把1.1.2複製到main，此授權取代歷史的「main未合併／不merge main／implement正式分支」與兩個AI平行整合規則。請核對遠端最新main後開始；可以用自己的gameplay分支／worktree保護工作，最終合併及發布回main。
- 正式遊玩：https://sces5504.github.io/Solaria-Remaster/?v=1.1.2 。其後若main更新，以最新PROJECT_STATUS、CURRENT_STATE、Actions及線上資源核對，不將main退回本文件的歷史SHA。
- 固定原版：tag `v1.1.2`、分支 `archive/v1.1.2`，兩者指向 `9abc6d8ce90bcde5ef292f0db6202dd38d993e05`。原1.1.2已發布遊戲程式來源 `7cff9de9ea3a1f0ace3aec735a1dfb3437158a74`，其後9abc只補證據文件。備份Release：https://github.com/sces5504/Solaria-Remaster/releases/tag/v1.1.2 。詳 `docs/handoff/BASELINE_1.1.2.md`。
- 備份不得推新commit、移動／刪除tag、覆蓋Release備份連結與下載檔或當工作分支。固定commit及下載檔保留完整來源；獨立遊戲下載封存分支archive/v1.1.2-files（0400546）同樣禁止修改；GitHub integration未允許管理防寫ruleset，不能聲稱平台防改鎖已啟用。需要回復時在最新main另建修復提交，核對備份程式／素材與現有文檔；保留main歷史及新的交接規則，不reset／force push。
- `implement/s00-s05`、art分支、PR2與docs規格分支都是歷史來源，不再發展或發布。PR4／5／6美術成果已全部接入1.1.2，不再等另一美術AI提交，不merge舊Draft PR2重複舊成果。
- 先核對pwd、git status、branch、log、remote。保護未提交修改，安全fetch最新main；有新工作保留，不覆蓋／reset／force。新Cloud可能沒有舊路徑、依賴、瀏覽器、/tmp或伺服器，不依賴主人電腦常開。原作sces5504/Solaria只讀，不改原庫，不整份搬其monolithic HTML。

## 2. 必讀文件與權威

先讀 `docs/ai-memory/AI_HANDOFF_MASTER.md`、`CURRENT_STATE.md`、`USER_PREFERENCES.md`、`PROJECT_MEMORY.md`、`DECISION_HISTORY.md`、`DEVELOPMENT_HISTORY.md`，以及本prompt／BASELINE_1.1.2。再完整讀根目錄AGENTS、GAME_SPEC、ARCHITECTURE、DEVELOPMENT_PLAN、DECISIONS、UI_UX_SPEC、TEST_PLAN、PROJECT_STATUS、CLOUD_START_PROMPT，尤其尾部增量與最新首節。

最新主人明示覆蓋歷史條文。玩法／數值由GAME_SPEC決定，UI_UX_SPEC決定呈現，ARCHITECTURE決定模組；程式只能證明實作，不等於主人批准設計。歷史不足標明，不補造。「只備份／等試玩／main尚未合併／兩AI分工／保留未來合作」等舊邊界已被後續指示取代。

## 3. 美術已定稿，禁止重製

維持1.1.2的精雕冒險像素、素材、色彩、UI外觀、光影、動畫與專用FX。不得換風格、重畫、退回舊atlas／幾何爆炸、再做三風格演示，或順手重排畫面。可調機制所需的資料／文案和確診跨層Bug的最小接口；保持外觀，交代來源分類、保存／回放影響。新增技能或修觸發時沿用既有對應素材與語義，不能為了省事全部套爆炸。

定稿包括：

- 64角色身份、204有效原創姿態：60類各ready／step／attack三張，三職業及南瓜四類各六張；六引擎狀態有重用，不能宣稱64類全部六張原創。九地形／場景物／事件地標／封印柱、獨立瞄準武器、主選單及職業肖像。法師為深髮紫袍尖帽，與銀髮青金劍士明顯區別。
- 明亮自然暗部、保留招式光影；火焰／熔岩／能量發光、较大樹柱及遮擋淡出。怪物與障礙圖集載入時按真實像素輪廓隔離鄰格浮屑，原PNG來源保留。
- 爆炸低遮擋、藍色格擋反擊。靜電釋放是電弧，永凍領域是冰雪，冰雹、漩渦、火環、雷暴渦井、潮汐脈衝、冰火裂域、引力、火鳥、劍氣、星刃等各有語義。行星爆／回響、描述指定的爆裂仍保留低遮擋爆裂；三道蒸氣波保持品質。
- `Visual.sourceAbilityId`／`periodic`為可選呈現資訊，舊存檔可缺省；來源ID優先於附魔元素，避免把附電行星爆誤變成靜電技。契約見src/render/ability-presentation.ts與docs/art-feedback。
- 跟隨圓形光環啟用時主角／武器在友方FX前，敵方危險幾何與彈幕仍更前；敵彈深淺雙輪廓跨沙地／熔岩／雪地清楚，沒有放大碰撞判定。
- 六事件首次戰鬥中央名稱＋短句2秒，再0.8秒淡出，不阻斷输入、不重播各波。RUN_END播6秒日光重臨動畫配字→16秒感謝字幕→原下一周目／完成／匯出構築，可略過；只UI計時，核心停止。不能刪除這些演出或讓它們擋住後續操作。

美術來源與SHA：public/assets/adventure/manifest.json、tools/adventure/source-atlases。證據：docs/art-upgrade、docs/art-feedback、docs/visibility-feedback。主要渲染入口src/render/stage.ts／adventure-art.ts／adventure-effects.ts／actor-isolation.ts／lighting.ts，事件與結尾UI在src/main.ts／src/ui/ending.ts／src/style.css。這些檔案不是禁讀；僅禁止未獲新授權的外觀變動。

## 4. 已實際接入的遊戲內容

S00–S05骨幹及五輪修訂已被主人接受；完整v1內容已接入並公開，不能從scaffold重做，亦不能宣稱S13硬體／人工全部驗收完成。

三職業、九地形／29普通怪／54主題程序房型、18地形Boss各兩階段三招、索拉里斯三血四柱、30＋1與周目、85卡、8橘／3普通紅／6事件紅裝、六事件及兩事件Boss、七收藏成就／三非戰力外觀、教學／圖鑑／音效、IndexedDB恢復／revision／錯誤流程。逐項查docs/validation的TERRAIN_MATRIX、BOSS_MATRIX、CARD_MATRIX、EQUIPMENT_MATRIX、EVENT_MATRIX、V1_ACCEPTANCE、RELEASE_CHECKLIST。

## 5. 1.0.1已修機制，不要當成待辦重做

詳docs/validation/POST_V1_FEEDBACK.md：

1. 橘紅裝名稱、背包文字／側欄框色、構築稀有度、圖鑑整卡／hover配色已修。能力家族圖案不是稀有度Bug；未知卡暗且不揭名字。
2. 魔王城「假柱」是可跨雷射機關誤貼柱子，已改貼地雕像印記；不能新增碰撞堵路。真正樹岩柱仍擋行走與彈道。
3. 實體掩體共用20耐久，Boss扣5／小怪扣4；完整承受4／5次，混合來源共享。傷後2秒無敵、同波最多一次；僅與玩家110×range圓相交才傷，無額外126.5加成、不須持靜電卡。遠處／無敵掩體仍擋彈，碎裂才移除；湖不毀。我方及無敵人來源機關不扣。敵彈、斬、衝撞、落擊、雷射都有来源，發射者先死不丟。舊5／10／15剩餘比例向上遷移20，碎裂0、保護與波次保留。
4. 寂夜鬼甲唯一南瓜固定250HP，三職／生命加成／周目／舊檔／清關及10秒復活一致；沿用甲、0.5秒傷後保護、吸火／近戰／合格吸血、卸裝消失。不能恢复3倍玩家HP。
5. Boss專流已修與路線相關的XOR/xorshift偏差。實際20,000seed×1／2／5／10周目條件抽樣恢復九池各約50%，512聯合組合；首周目火山50.65／49.35、叢林50.77／49.23。無保底／強制交替，已保存journey不重抽，布局與路線流不改。工具與證據已保存。

## 6. 必須保留的玩法

桌面單人俯視動作roguelike、PixiJS v8／WebGL、TypeScript／Vite、Node24與lockfile、獨立60Hz，input/state/render分離、序列化、穩定ID繼續服務單人。主人已取消未來多人／連線／合作房計畫，不保留或新增其專用架構；Web／Pages託管仍維持。

WASD、左鍵持續普攻與右鍵職技可同時用，Space閃避無無敵、E戰鬥拾裝／清關進門；清關仍可攻擊，穿戴限制依最新規格。只有一把瞄準武器，全房8:5適合高度、不靠捲輪；分數／屬性／裝備HUD、繁中短句與世界觀，不能在玩家流程露出開發術語。三選一免費刷新一次，reload不能重刷；未知星典不揭卡名。

清算先救命／計分，再XP與補包吸附約1.1秒，後選卡，裝備留地。有限怪池，同屏4–10、低4補有限預備，耗盡才不足4；無無限援軍／擠團。主題程序通路與真掩體含王房，不回固定預製亂撒。預警／鎖向／合理彈速／lore移速維持。來源分類、容量／融合、百分比／副鏈折扣、抽取／事件、死亡無永久戰力依最新GAME_SPEC；永久收藏與外觀不是戰力。

既有明示：炎龍前80°、不週期環爆；燼火其他目標＋3層、有限安全連鎖與來源折扣；冰雹85／漩渦94／冰火領域110基半徑×range；職技CD5／6／3秒、冷卻條夾0–1；蒸氣0／0.2／0.4秒三波各24基傷、基半徑60／110／160、skill＋basicHitProxy，不增普攻施放、不雙乘倍率。四柱封印旋轉60°缺口是已明示特殊例外；其他Boss環彈完整。麻痺／冰凍區分、藍色雷電、輕震／格擋回饋、乾淨石門。不要重問已回答的例外。

## 7. 驗證界線及節制測試

- 1.0.1舊玩法來源：326unit／81Chromium，正式新局／舊檔與五项反馈回歸，詳原矩陣。
- 1.1.0完整美術來源：327unit／完整98Chromium，Pages38243697393、線上18PNG／新局／輸入等PASS。
- 1.1.1：331unit／10相關browser（不是完整100），Pages38256291930、19PNG線上PASS。
- 1.1.2：332unit／4相關browser（不是完整104），Pages38262913407、20PNG線上／輸入／RUN_END呈現fixturePASS。main遷移後確切HEAD、Actions與核驗讀最新CURRENT_STATE與BASELINE。不要拼接不同來源結果冒稱同一輪完整驗收。
- 保留所有初輪FAIL與修正／補驗，見相應results。1.1.2勝利fixture不能當自然完整擊敗索拉里斯。
- S13仍有真GPU60FPS／600彈60秒／GPU記憶體、Firefox／Safari、三職自然取得一般／強構築完整30＋1及人工周目、聆聽、全部短FX逐幀NOT_RUN。SwiftShader密集約1.3–1.5秒／幀，60FPS為FAIL；Cloud600功能／heap重啟只PASS其範圍。一般劍1／2周目單王fixture有死亡，bot只5–8房／逾時，不当自然通關。M01–05已修，M06架構接入但硬體未證，M07明示例外，M08候選依證據處理，M09旧scaffold已過時。
- 主人連續要求小修改不要反覆跑很多測試。先重現問題，跑相關unit／browser與check/build/format一次；只因新改動、失敗或未解風險補驗。涉及廣泛核心、保存遷移或重大版本才擴大。禁止弱化斷言／偽造PASS。
- 現有Pages手動scope full、art-feedback、visibility-feedback：後兩者只驗特定美術畫面，不可拿來替代新的機制回歸。日後應選與變更相符的檢查；一般push仍完整。使用skip ci只為避免已安排的重複流程，必須有明確替代驗證，不能無檢查發布。

## 8. 開發、交付與後續工作

開發／測試在Cloud或CI。可用cloud runtime skill先讀並核對網路及實際憑證可用性，不輸出秘密。Node24、npm lockfile；bash scripts/cloud-setup.sh目前會完整安裝／建置／browser／unit，新環境按需要用；既有環境的小修不要反覆跑整個setup。browser先build，執行期間不改dist。只用既有GitHub Pages，不用Sites或新平台。

主要擁有src/game、core unit／玩法browser、GAME_SPEC／決策與平衡證據。入口src/game/core/run.ts；掩體core/cover-rules.ts、systems/cover.ts、combat／projectile-sweep／enemies／biome-bosses；伙伴systems/companion.ts；抽選data/journey.ts；checkpoint-schema.ts與其他persistence負責遷移。正常AI、幾何、來源分類、有限怪池／配額／升級要實際執行驗證，不只數資料長度。

先恢復main及最新證據，核對已修的掩體／250伙伴／Boss抽取／舊檔、美術契約，再依主人新回饋處理非美術問題。普通數值／升級可依證據自主調整，記原因、前後與回歸；新核心機制照明示要求，不重問已授權內容。真正規格矛盾列具體來源及影響，問必要問題時仍繼續獨立工作。自然／強構築和周目須保留死亡、時間、取得卡裝紀錄，不把預授最高DPS當平衡PASS；硬體不可用維持NOT_RUN，不要求主人本機常開。

你負責整合到main與發布。核對遠端HEAD、有新提交先fetch保留，不force。版本／bundle／PNG SHA256驗正式站來源；用新局、保存與與變更相關的案例確認，必要時用53691bf的舊IndexedDB fixture。不要拿舊dist發布新程式。

線上工具見tools/validation/pages.config.ts、docs/validation/tools/pages-cloud.config.ts；本次也有docs/visibility-feedback/verify-release.mjs。路徑是示例、移到新環境要調整。保持代理與TLS驗證；Chromium NSS DB若唯讀，按環境授權實際資料庫寫入，不改HOME、不ignoreHTTPS、不繞proxy。Pages會略過純Markdown／docs改動；workflow及程式改動需要相符部署核驗。

重大修復、數值、架構、里程碑增量更新PROJECT_STATUS與相關六記憶，CURRENT_STATE記UTC、MASTER同步；保留歷史、取代理由及FAIL，不寫Token／Key。中斷時保存commit、未完成／恢復命令，不把部分當全完成。完成後提供實際網址、版本／main SHA／PR、改動與真實驗證結果。與主人用繁中短且具體交流。

現在先核驗環境、main、文件及已知候選，完成你可獨立做的非美術工作；有新回饋就接著處理，不停在計畫或要求主人反覆說「繼續」。
