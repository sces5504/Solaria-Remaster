# v1內容與實際驗收矩陣

## S14事件王測試時鐘修正（2026-10-11 21:07:53 UTC）

7716push的Development77全PASS，但同來源PR checks另輪75PASS／2FAIL（聖誕、萬聖三招斷言收到2），重試仍FAIL；完整log保存，不能只選成功輪。前一Pages發布取消避免部署已被取代來源，其browser log也75PASS／2FAIL。386c1d5 setup修复已推；其Pages也取消，准备包含事件測試修復的新來源。

事件測試原先等9.5秒牆鐘；固定核心與渲染分離、慢WebGL有追趕上限，牆鐘不保證模擬已到同一時刻。改等唯讀solariaDiagnostics的核心時間達原fixture+9.5秒；仍由正式RAF／AI執行，匯出attackLog每階段3種斷言保持，不改AI、不跳核心tick、不取消招式。等待上限60秒、每兩階段case180秒。首次本地誤用Pages子路徑dist搭root preview，啟動未完成而中止，不記PASS；停止瀏覽器後正常build再重測。

## 最終內容覆蓋索引（發布結果另見最新首節）

| 項目    | 接入內容                                                                         | 核驗入口                                                                                 |
| ------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| S06–S07 | 9地形、29普通怪、54主題程序房型、機關／詞條／精英、18地形Boss各2×3招             | TERRAIN_MATRIX、BOSS_MATRIX、biomes／monster-details unit、biomes／biome-bosses browser  |
| S08     | 30＋1、索拉里斯3血／4柱／字幕、60°封印例外、構築繼承及周目成長                   | journey／solar-arena unit、solaris browser                                               |
| S09     | 85卡抽取／升級／代價／失效與來源                                                 | CARD_MATRIX、cards／advanced-cards／source／handoff-regressions unit及browser            |
| S10     | 8橘、3普通紅、6事件紅、夥伴／吸血／卸裝                                          | EQUIPMENT_MATRIX、equipment-integration unit、equipment browser                          |
| S11     | 六事件三有限波、2事件Boss、保證獎勵、整局一次                                    | EVENT_MATRIX、events unit及browser                                                       |
| S12     | 8:5 UI、手冊／教學／星典／成就／外觀／音效、舊檔遷移與保存錯誤／revision         | journal／profile／sound／persistence unit、journal／recovery／persistence-errors browser |
| S13     | 真碰撞時間序／SpatialGrid／彈池／渲染池、24＋8構築探測、密集功能、10＋30 restart | BALANCE_PERFORMANCE及原始results；硬體／人工項仍NOT_RUN                                  |
| S14     | Pages建置／CI／正式新局及53691bf舊檔直接繼續                                     | 最新發布首節及v1-pages結果；未完成前不寫PASS                                             |

這是內容與可重現回歸索引；不把資料存在等同逐幀人工美術驗收，也不把單王fixture當完整30＋1自然取得構築通關。以下較早檢查點保留當時的缺口与失敗，均以最新首節為準。

## S14 CI腳本修復（2026-10-11 20:58:37 UTC）

7716版本Development Checks完整77 Chromium PASS（21.4分鐘），但log顯示runner沒有rg，cloud-setup的unit條件因此被略過；該流程不能記307unit PASS。Pages流程獨立npm test已307 PASS，目前瀏覽器／部署仍執行中。已將setup改成find的非空結果判斷，不依賴rg；無rg的stub PATH確認確實呼叫npm test，bash語法、真實check／307unit再次PASS。保存此修復後推既有implement分支，重新跑完整發布CI與正式站核驗。

遊戲內容／數值未再變更。新增合法詞綴／品質的24王戰與8格擋對照、歷史工具資格註記，見BALANCE_PERFORMANCE。人工完整旅程、真正GPU、其他瀏覽器仍NOT_RUN；不把bot fixture結果冒稱人工通關。

## S14發布進度（2026-10-11 20:37:40 UTC）

遊戲版本1.0.0／來源7716ae0d927870205002f862b8921cfd3aafc048已推implement/s00-s05；原9f88061為遠端祖先，沒有回退、force或merge main。PR2已更新完整v1內容與限制，仍Draft，base docs/solaria-cloud-spec。[發布Actions38172556955](https://github.com/sces5504/Solaria-Remaster/actions/runs/38172556955)目前完整77 Chromium回歸中，CI check／307unit／format已成功，尚未部署新站。

Pages子路徑本地新局／左右鍵／保存reload與53691bf舊IndexedDB直接繼續2PASS；追加JS SHA256與各atlas／manifest本地相同的版本核對亦2PASS。固定Pages build與SOLARIA_PAGES=1的4174 preview，舊4173相對base服務不用作子路徑驗證。正式站仍舊遊戲直到發布job成功；接著立即正式URL兩項驗證，保存結果並更新此首節，不提前稱成功。

完整內容與逐項索引見RELEASE_CHECKLIST／五矩陣。硬體／人工NOT_RUN與SwiftShader壓力不達60FPS仍有效，M06架構接入不等於FPS驗收。此次CI仍在跑，勿將本地75＋修正5的聚合冒稱最新全77PASS。

## v1發布前收束（2026-10-11 20:26:13 UTC）

內容全部接入：九地形／29普通怪／18地形王、索拉里斯三血四柱／30＋1／周目、85卡、八橘／三普通紅／六事件紅裝、六事件／兩事件王、完整收藏UI／音效／保存錯誤與遷移。逐項入口見docs/validation/RELEASE_CHECKLIST與五份矩陣。

固定S13新版build的76 Chromium整輪完成：75PASS／1FAIL，20分鐘。唯一FAIL是feedback測試在選卡交易尚未結束就跳頁，beforeunload消耗一次dialog handler，下一次匯入confirm被自動取消；trace已確認，修正等待saving完成，不取消正式存檔保護。最新吸血鬼HUD補灰色不可回復區，保持真實生命比例，四成是回復上限而非目前血量。小型UI補正後check／307unit／build PASS，最後5瀏覽器全部PASS。第一輪5案例4PASS／1FAIL為HUD每80ms重建而量測得到NaN，改在單次page.evaluate內查詢及量測新DOM，原比例斷言保持，第二輪5PASS。不能把前版76當新版全過，發布CI將完整77項驗證後才deploy。

S13碰撞／SpatialGrid／彈池與渲染退休池已接入；Cloud10／30次UI重啟記憶體功能PASS、600彈功能PASS；CloudSwiftShader密集平均1464ms/幀、P95 1921ms，不達60FPS。24場合法預算王戰最後按本周目首29房配額修正為25／40／84／188級，橘裝三詞綴、CPU排除bot；12場強構築均擊殺，一般劍前三周目死亡保留。較早工具的全31房估級／少詞綴／CPU含bot已註記，詳見BALANCE_PERFORMANCE。

NOT_RUN：實機GPU60FPS／600彈60秒／真設備重啟GPU記憶體、Firefox／Safari、三職一般／強構築自然30＋1完整人工平衡與人工周目、人工聆聽／全部短FX逐幀目檢。這些限制不能由功能PASS替代，也不能稱全部驗收完成。

Pages子路徑預檢：新局／同時普攻職技／保存重載、直接繼續53691bf舊IndexedDB兩項PASS18.3秒。首次誤用仍採相對base的舊preview服務而2FAIL；改用SOLARIA_PAGES=1啟動獨立4174預覽後，未改遊戲即2PASS。這不是正式站故障。

發布branch implement/s00-s05，PR2仍以docs/solaria-cloud-spec為base，保留main。Pages workflow新增忽略純Markdown／docs更新，避免發布後追加驗證紀錄重覆部署相同遊戲；程式／素材／工作流程變更仍跑完整部署CI。遠端核對仍9f88061，前一備份d2d0278；目前準備保存1.0.0並push既有實作分支。S14未部署，不提前宣稱成功。

## 第六個內部檢查點：S13接入與v1回歸（2026-10-11 20:06 UTC）

collision-time／SpatialGrid／全彈ContactQueue已引用於正式combat，按真接觸時間處理命中；WeakMap彈池與Stage退休Sprite／BitmapText池已接入，不序列化、不刪有效攻擊或獨立傷字。boss-beams已引用，強光束各地形／事件保持專屬造型。失焦恢復時鐘歸零與取消匯入的busy復原已驗證。

307unit、check/build PASS。10次UI重啟JS記憶體回歸及追加30次PASS，後15次heap範圍約0.155MiB；600彈密集功能PASS，但Cloud SwiftShader軟體WebGL平均1464ms/幀、P95 1921ms，遠未達60FPS。真設備GPU與人工平衡仍NOT_RUN；詳見docs/validation/BALANCE_PERFORMANCE.md。24场三職一般／強構築與1/2/5/10周目王戰完成量測，保留一般劍死亡；強構築補齊傷害／攻速／CD分配後全部擊殺，調的是探測構築，不改敵血或固定倍率。

最終王XP450→440依最新GAME_SPEC房間公式，31房8890、約26級，未恢復舊750或20–25級。版本package1.0.0。發布前1280×900預檢发现側欄把畫布拉到1.38比例，已修側欄定位避免拉伸，本地正常新局／舊檔兩項PASS；新增四尺寸8:5／無全頁捲動回歸。原76整輪在此之前中斷，不能寫全PASS；已重新開始固定新版build的完整76回歸。

舊檔fixture由53691bf原始核心產生，舊／新validate均PASS；直接写旧IndexedDB格式後繼續、再次保存及reload本地PASS，不是用v1newRun偽裝舊檔。工具與來源在docs/validation/fixtures。前一已保存d2d0278於backup/v1-progress-2026-10-11；正式仍53691bf，尚未發布。剩下完整回歸、保存源碼與記憶、推implement/s00-s05、Pages CI／部署及正式網址正常新局／舊檔核驗。不中止、不等逐階段指示。

## 第五個內部檢查點：S12接入與王房視覺（2026-10-11 19:19 UTC）

旅人手冊／可跳過首局導引、七項收藏成就、三種非戰力外觀、旅程紀錄、全螢幕8:5與音量重載均已實際接入。SoundController原創多層合成已替代舊mixer；波形量測PASS，不當作人工聆聽。Checkpoints入口換至RunStore／schema分離，既有schema1／53691bf旅程可繼續，保存獨立永久紀錄／前版／壞資料，星典可獨立備份，兩分頁revision墓碑防clear後復活。配額／拒絕存取／資源失敗／壞檔皆提供清楚流程與原始備份；有效備份可明確恢復損壞永久紀錄。

百分比hit入口再隔離代理／元素／副鏈／強制暴擊，不接受原型鍵外觀，不帶未知永久戰鬥欄位。保存中選擇按鈕停用；beforeunload保護未完成交易。普通瀏覽器重載回歸等到交易完成，再核對保留選擇；已用延遲交易completion案例驗證保護及保存後恢復。

Boss補獨立冰息／藤鞭／鯨鰭／重斬動態與各地形彈體；索拉里斯seed日輪王房、8可破坏掩體、四柱和中央通路跨100seed×4周目PASS。場景目檢發現Pixi arc連接前一路徑造成額外長線，已顯式moveTo修正，後續針對視覺回歸核對。TERRAIN_MATRIX／BOSS_MATRIX／CARD_MATRIX更新，矩陣是能力與程式回歸索引，不捏造逐幀人工全驗收。

PASS：302unit（295接入回歸＋3未接入碰撞／網格工具＋4未接入全彈時間序工具），check/build。S12首輪13案例10PASS／3FAIL修復後13PASS；再加入离頁保護／王房／BossFX21Chromium全部PASS4.8分鐘。完整71項曾在第29項後中斷，1FAIL／28PASS，原因融合畫面更新後測試未等交易完成立即重載；這輪不能標完整PASS。修復後需要新版完整回歸。目檢修正弧線後最後5視覺案例全部PASS1.3分鐘，封印場景再目檢無額外連線；format PASS。

S13準備：contact-queue／projectile-sweep／SpatialGrid與RetainedPool尚未接入，不能標M06已完成。命令式三職一般／偏攻探測只選真實候選、不改敵血不授卡；初版避險欄位錯誤已修，補路徑後三職抵達5–7房死亡，不能當完整30＋1平衡通過。後續仍須1／2／5／10周目構築與壓力／記憶體實測；硬體GPU60FPS、600真GPU、10restart真設備、Firefox／Safari、人工聆聽／構築平衡NOT_RUN。

前一已保存來源89375d9在backup/v1-progress-2026-10-11。此檢查點來源hash以git log核對；正式仍53691bf、遠端implement仍9f88061，尚不部署部分v1。直接接S13碰撞／物件重用／壓力和平衡，再S14完整Pages，不等逐階段指示。boss-beams已準備尚未引用。

## 第四個內部檢查點：六事件接入（2026-10-11 18:36:16 UTC）

六事件實際替換普通房，三有限波／兩事件王各2×3招／專屬紅裝保證／整局一次跨周目／原地形XP與難度／無普通詞條、機關全部接入。新增追蹤冰鈴提前.4秒鎖點、真正合法躍擊、軍旗附近加速／增傷及旗倒解除、禮盒／幽魂／稜光／隕星專屬彈體與事件景物；事件保存格式驗證與同房不重抽已測。普通精英盾改在最終生命詞條後配置，恢復20%最終生命。

PASS：最新295unit（288已接入遊戲／事件回歸＋4未接入profile＋3未接入碰撞／網格工具單測），check/build/format PASS。完整62 Chromium全部PASS15.5分鐘；先前9事件案例7PASS／2FAIL的原因是測試未accept第二階段存檔覆蓋confirm，已修dialog handler，完整重跑兩王2×3招及獎勵讀檔均PASS。新增未引用S12/S13模組後build的13個JS SHA256與62測試bundle完全相同。永久log見docs/validation/results/_events_。

事件與兩王实际畫面已目檢，王招式啟動紀錄每階段3種由正式核心執行驗證；這不等同逐幀特效／人工平衡／硬體FPS驗收。docs/validation/EVENT_MATRIX.md與EQUIPMENT_MATRIX.md為逐項入口。地形王仍有部分通用彈體／斬擊待補相應招式，不能把S06/S07美術全面驗收標完成。

S12準備但尚未引用：profile/records/profile-store/run-store/checkpoint-schema、journal/room-copy、SoundController；S13準備但尚未引用：collision-time/spatial-grid、boss-projectiles。特別RunStore新revision墓碑／profile備份尚未實際替代舊Checkpoints，不能宣稱已解決清除旅程的兩分頁ABA或永久紀錄壞檔。只有前三項component單測不能替代整合驗收。

前一已保存檢查點ba94447於遠端backup/v1-progress-2026-10-11。本次檢查點來源commit以git log核對，持續同備份分支保存，不部署部分v1。正式仍53691bf/Pages，遠端implement仍9f88061。接著立即S12整合UI／教學／成就／外觀／音效／保存錯誤與遷移→S07專屬FX剩餘核對→S13平衡效能→S14完整Pages。硬體GPU60FPS／600真GPU／10restart真設備、Firefox/Safari、人工構築周目平衡NOT_RUN。

## 第三個內部檢查點：特殊裝備接入（2026-10-11 18:11 UTC）

實際接入17特殊裝備、掉落品質與周目新裝成長、南瓜夥伴吸火／碰撞／復甦／卸裝、百分比獨立來源、裝備特效及持久化。61／69／73扣盾受傷已修。71延遲副本改為保存各施放快照的隊列，短於.8秒冷卻不再覆蓋前一副本；副本不重扣代價、不改CD、不重計數。普通紅裝／橘裝已正常掉落；六事件紅裝能力可用，但保證事件取得待S11。

PASS：最新278unit、check/build/format。完整52Chromium曾全部PASS；後續每次有修改，以equipment／advanced-cards／last-polish針對回歸；最新9項全部PASS。實際WebGL場景目檢三裝備組合無資源錯誤；部分短暫特效截圖錯過有效時刻，不宣稱已完整逐特效目檢。獨立未接入events單測9項包含於278總數，不能算六事件已完成；sound-bank亦僅準備未引用。

驗收入口 docs/validation/EQUIPMENT_MATRIX.md；永久log docs/validation/results/_equipment_。正式遊戲仍53691bf，遠端實作仍9f88061；f322a36是前一已保存檢查點，新檢查點commit以git log核對，只推備份分支backup/v1-progress-2026-10-11，尚不部署部分v1。

接續：立即S11接入六事件三波／2王／專屬布局與FX／整局一次及存檔→S12教學圖鑑成就外觀音效保存错误→S13正常／強構築與效能／記憶體→S14完整Pages。人工平衡、硬體GPU60FPS、600真GPU、10restart真設備、Firefox/Safari仍NOT_RUN。本檢查點不是完整v1，也不等待階段指示。

## 第二個內部檢查點：85卡回歸（2026-10-11 17:20 UTC）

256unit PASS（248實作回歸＋8未接入裝備／南瓜模組單測），check/build/format:check PASS。48Chromium先46PASS／2測試資料FAIL，修正後融合案例PASS，賭徒案例因重載後未等遊戲畫面就按I再FAIL；加入畫面就緒等待後該案例PASS12.1秒。48個案例最後全通過，不能將首次48全過當作事實。新增未引用模組後再build，全部JS檔SHA256與完整回歸bundle相同；未在任何瀏覽器測試執行中重build。永久結果見docs/validation/results。

85卡已接入，但S09仍需裝備聯動與正常／強構築平衡。已查實新缺口：GAME_SPEC第4節將扣盾定為有效受傷，當前hurt以溢出HP>0判定61/69/73，盾全擋時不觸發；下一個裝備整合修正並加實測，不把本次綠色測試當該缺口已解決。S10/S11仍未接入遊戲，獨立裝備／南瓜測試不能替代完整戰鬥驗收。

正式Pages仍原里程碑，持續完成剩餘範圍；不等待逐階段指示。源碼備份分支不觸發部署。

## 85 卡與精準怪物行為接入（2026-10-11 17:10:38 UTC）

[程式事實] 85 張卡全部進入合格抽取池，70–85 一次性、紅卡互斥／代價／裝備限制／三元素融合選擇、雙重術式獨立副本、首段聚焦、來源吸血及封印後失效標示已接入。普通怪實際發彈數、側移、波形彈、原生＋詞條雙元素、600 全批延後與封印柱不拉扯已修，boss-telegraph／enemy-impact 分類繪製已接入。248unit PASS，check/build PASS；format:check 修正新增案例後 PASS。逐卡入口新增 docs/validation/CARD_MATRIX.md，人工逐卡／構築平衡仍 NOT_RUN。

[驗證中] 48 Chromium 正在執行，新增兩案例先因測試錯誤 FAIL：回主選單按鈕名稱誤寫、提前用尚未接入存檔格式的橘裝及徽記文案誤寫。已修案例，待完整既有回歸結束後針對兩失敗案例重跑；不重 build 改動測試中的 dist。測試 /tmp/solaria-85-browser-full.log；248unit /tmp/solaria-85-unit-final.log。未確認瀏覽器全過之前不宣稱通過。

[後續準備，尚未接入] equipment-abilities／companion 能力模組、event-content 六事件族群與兩Boss資料、create-event-atlas.py 原創13造型78影格（含禮盒、雪怪、血蝠、狂化血徒、幽魂、南瓜、外星三兵種、星塵／幼獸、霜鈴老人、南瓜災主）。不計為完整 S10/S11。血月百分比傷、南瓜吸火碰撞、卸裝、掉落品質及事件三波仍要整合。

[提交／發布] 已驗證內部檢查點 d4f54ec 在本地 implement/s00-s05；備份遠端 backup/v1-progress-2026-10-11 已推送，不觸發 Pages。正式實作遠端仍9f88061、遊戲仍53691bf。此處未發布完整v1，也未結束任務；繼續S10/S11、完整UI／音效／保存／S13／S14，勿為配合雜湊回退。實機GPU60FPS／Firefox／Safari／人工周目平衡仍NOT_RUN。

## 開發檢查點驗證收束（2026-10-11 16:27:16 UTC）

215unit、TypeScript check、build、format:check PASS。新版46Chromium：43PASS、3因舊房號断言FAIL；仅更新第1/2房總數5→31後，3失敗案例重跑PASS（38.2秒），本輪46案例最終全部通過。沒有藉重build改測試中的dist。此檢查點不是S06–S14階段完成，更不是完整v1；自然完整31房與人工／硬體平衡NOT_RUN。新增王、沙漠底圖與索拉里斯四柱實際畫面已目檢；其餘逐招專屬特效仍續作。

後续已准备但尚未接入的独立模块：advanced-cards 70–85資料、equipment十七能力模板、events六事件路由資料、monster-details精準行為、boss-telegraph／enemy-impact招式繪製、ability-policies紅卡限制與回復上限。這些不計入遊戲已實作數量（現為69卡），不宣稱特殊裝備／事件已完成。存本檢查點後繼續接入、逐項測試並完成全部範圍。

驗證入口 docs/validation/V1_ACCEPTANCE.md；永久结果 docs/validation/results。正式Pages仍旧里程碑，不将此内部检查点当正式v1发布。

> 2026-10-11 16:11 UTC 驗證更正：新增 enemyElement 的 Area 型別漏宣告使最新 build 失敗；命令未啟用 errexit 而繼續以舊 dist 跑46browser，本輪結果作廢，不是新版驗收。已停止該程序，補型別並改成前置失敗立即停；重新 check/unit/build/format/browser，最新結果見後續紀錄。較早42browser確實PASS，但不得代替新版。215unit確實PASS。

這是逐項驗收入口，尚未交付完整 v1。測試屬程式／瀏覽器事實，不代表主人已批准新美術或人工平衡。

| 範圍             | 已接入                                         | 驗收缺口                                                   |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| 草原＋八新增地形 | 九地形、29普通怪、六主題、機關、詞條、精英能力 | 部分普通怪精準側移／正弦彈／完整專屬特效、每模板目檢       |
| 十八地形王       | 舊兩王＋新增十六王，每王2×3招、專屬布局        | 全階段招式視覺與自然戰鬥、強構築回歸                       |
| 索拉里斯         | 三血、四柱、旋轉60°封印缺口                    | 最新瀏覽器畫面、字幕／下一周目自然流程與平衡               |
| 30＋1／周目      | 六段分支、構築保留、seed與草原舊檔遷移         | 裝備成長、全部機制五級上限與邊際／敵速度控制上限           |
| 卡片             | 1–69 接入；60–69 條件與對照核心測試            | 70–85 未實作；完整85逐卡矩陣與特效                         |
| 特殊裝備         | 基本裝備保持                                   | 八橘／三普通紅／六事件紅尚未實作                           |
| 六事件           | 未實作                                         | 全部事件模板、三波、兩Boss、一次計數、奖励                 |
| UI／音效／保存   | 舊完整骨幹、坏檔previous回退                   | 教學／成就／外觀／新音效／所有錯誤與migration/revision流程 |
| 平衡／效能       | 215核心unit PASS；原基線128/17 PASS            | 人工平衡及硬體項NOT_RUN，尚未S13                           |
| Pages            | 正式舊版仍在线                                 | 本輪未部署，尚未S14                                        |

## 實際執行紀錄

- Cloud Node24 / Chromium headless：既有起點128unit、17browser PASS。
- M01 真实IndexedDB损壞回退、提示、繼續保存、profile保留与重载 PASS。
- 新地形与十六王加入，主線接入前42browser PASS；主線／69卡／索拉里斯新版46browser正在跑。
- 最新215unit PASS；TypeScript check、build PASS；format修正後PASS。
- 實機GPU60FPS、600有效彈最密場、10restart記憶體、Firefox/Safari、人工三職普通與強構築1/2/5/10周目：NOT_RUN。
