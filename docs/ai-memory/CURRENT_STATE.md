# CURRENT_STATE — 最新工作斷點

## 取消未來連線計畫，單人美術選樣已發布（2026-10-12 07:57:13 UTC）

主人明示取消遊戲未來連線功能，取代D02的2–4合作邀請房／預留多人邊界計畫。後續以桌面單人遊戲為目標，不新增連線預留層、房間backend、同步或重連功能；現有單人固定60Hz、input/state/render分離、序列化、穩定ID與來源／陣營仍服務效能、測試及存檔。更新AGENTS、GAME_SPEC、ARCHITECTURE、DECISIONS與雙handoff入口；原歷史保留，不把取消遊戲連線理解為取消Web託管。

三風格美術選樣已在 https://sces5504.github.io/Solaria-Remaster/art-review/ 上線，發布来源0fec7c7d77d62aad88f2e32ed74fd543549a61ce、Pages38216794017成功，check／326unit／format／完整81Chromium與deploy成功。獨立入口實際線上4ChromiumPASS32.1秒。正式遊戲22JS／CSS／原素材SHA256與1.0.1一致。可維護來源Draft PR4／art/style-lab；三款、三地形、八怪、六王兩階段、並排／放大與真實輸入已完成，主人尚未選定風格。

額外檢查確認並排進全螢幕需回單款，fullscreen元素由瀏覽器強制滿視窗，改把實際canvas與HUD共同8:5置中；風格按鈕取得焦點後1／2／3快捷鍵亦補正。補正已完成本地驗證，下一版發布尚待完成，勿先寫線上新版PASS。單姿態不當完整逐幀動畫；原GPU／人工S13界線保持。

## 美術三風格獨立演示準備發布（2026-10-12 06:57:43 UTC）

主人新要求先展示三款精緻一致像素美術，選定後才繪製全遊戲；覆蓋舊「不為改風格重畫」限制，但並未選定風格。精雕冒險／暗黑哥德／立體精緻已製作三地形、八怪、六王與法師樣本，用1.0.1真實戰鬥核心、預警、光影與FX展示；單姿態不冒稱完整動畫。

主人明確批准「允許發布獨立演示頁」。新增 public/art-review/index.html 單檔於既有Pages，正式遊戲src／原素材／workflow保持，沒有合併art/style-lab渲染修改。預定 https://sces5504.github.io/Solaria-Remaster/art-review/；尚未完成部署，不提前稱已發布。詳 docs/art-lab/REVIEW.md 與source.json。

最終單檔4Chromium與九張實際WebGL擷取PASS，同tick切換、全部展示物／兩階段、真實輸入、並排／放大、8:5、不污染IndexedDB與既有音量；無外部素材請求。完整發布CI與正式URL核驗待完成。file://被管理政策阻擋，只HTTP測試，真GPU／完整逐幀／人工與原S13NOT_RUN界線保持。

## v1.0.1已發布：五項修正與雙chat交接完成（2026-10-12 05:24:59 UTC）

版本1.0.1／部署來源c07e63f800530264149347436f6ed73a0e22c519／implement/s00-s05已正式發布[GitHub Pages](https://sces5504.github.io/Solaria-Remaster/)。前一5856e62安全快進接續，無reset／force／merge main，原作只讀。PR2仍Draft、base docs/solaria-cloud-spec，保留全局S13未完成界線；本輪五項修正與兩prompt交付已完成。後續純文檔提交不改正式遊戲，文件HEAD看git log。

PASS：check／326unit／build／format、本地完整81Chromium19.7分鐘；./同案例導航調整後local4再次PASS。發布來源三輪完整CI成功：push38205408151（81browser18.4分鐘＋326unit）、PR38205411463（81browser30.0分鐘＋326unit）、[Pages38205408084](https://github.com/sces5504/Solaria-Remaster/actions/runs/38205408084)（81browser29.7分鐘＋326unit）及deploy成功，均無flaky。gh watch有一次讀annotations HTTP401而退出，直接run API／CLI核對與完整log確認不是測試失敗，沒有登入或改憑證。

正式URL六案例PASS：既有pages2（23.6秒）正常新局／同時攻技／8:5／保存reload、53691bf舊IndexedDB直接繼續与再保存；本輪post-v1-feedback4（49.8秒）背包／側欄五色名稱、六色構築／已知圖鑑與未知不揭名、橘紅整張／hover且保留能力家族圖色、魔王城地面機關可跨越与真柱碰撞、舊鬼甲250且生命卡不放大。JS index-RGCOH5Lt／四atlas／manifest SHA256與本地Pages bundle一致，資源無錯誤。線上圖／requests／logs已存results。

五項結果：確診的橘紅裝／卡稀有樣式与特殊名補齊，不改原本正確色與能力家族圖色；魔王城非實體雷射機關不再冒充石柱，改貼地雕像印記；所有實體掩體20耐久共用、Boss扣5／小怪扣4、2秒保護、同波一次、只與玩家110×range圓相交可傷（基126.5），遠處仍擋彈、湖／友方／無敵人來源機關不損，實際扇形／衝撞／射擊／落擊／半寬雷射判定與持久來源，舊耐久比例／保護時間保留；伙伴固定250含三職／升血／周目／舊檔／復活，甲與吸血來源／卸裝保持；Boss實際路線抽選原被XOR/xorshift相關綁成固定王，專流混合後九池約各50%／512組合，舊journey不重抽、不加交替保底。詳GAME_SPEC最新末節、POST_V1_FEEDBACK與新增unit／browser。

兩份可全文複製的獨立new chat prompt：docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md（core／數值／機制／Bug及兩邊整合Pages）、ART_NEW_CHAT_PROMPT.md（sprite／專屬FX／UI／音效呈現、獨立art分支交整合窗口）；README索引。已含本輪確切部署源、全部必讀、現況／測試、Steam品質與五輪保留體驗、最新掩體250與Boss修正、存檔／死亡／來源邊界、協作／分支／發布／記憶、未測與恢復。沒有在本對話建立new chat或spawn agents。

原全局S13界線不變：Cloud600彈／各傷字功能與10／30重啟JS heap只PASS其範圍，SwiftShader密集60FPS FAIL；真GPU／GPU記憶體、Firefox／Safari、自然一般／強構築完整30＋1及人工周目、聆聽／全部短FX逐幀NOT_RUN。不把本輪修正完成寫成完整v1全項驗收完成。後續由兩chat從最新遠端HEAD与此首節接續，核心candidate查實再修，不回骨架、不復舊規則。

## v1.0.1完整本地回歸完成，準備發布（2026-10-12 04:46:17 UTC）

check／326unit／build／format PASS；完整81Chromium全部PASS19.7分鐘，含新四項、原85卡／17裝備／六事件／全王／存檔／10restart／600彈功能。之後僅將新案例load導航/改./以便同案例實測Pages子路徑，遊戲與bundle沒有變；local4再次PASS45.5秒，發布CI將完整81跑此版本。沒有測試中重build dist。

五項修正及兩全文prompt已完成源碼／文檔、之前失敗均保留。正在提交1.0.1並推既有implement/s00-s05，PR2保留Draft／原base，main未合併；正式仍前版1.0.0直到Actions成功，不提前宣稱新站已發布。隨後正常新局／旧IndexedDB2案例＋本輪稀有度／城堡機關／250伙伴4案例正式URL實測，并更新部署hash与兩prompt。

S13真GPU與人工NOT_RUN及SwiftShader60FPS FAIL不因本輪完整功能回歸變PASS。交接入口docs/handoff/README、兩自包含prompt；gameplay整合發布、art獨立分支，不啟動新chat／代理。

## v1.0.1試玩修訂與雙chat交接準備（2026-10-12 04:32:03 UTC）

使用者本輪五項已查實並實作，詳GAME_SPEC／UI_UX_SPEC／DECISIONS／TEST_PLAN末尾及docs/validation/POST_V1_FEEDBACK。橘紅裝名稱／側欄、構築／圖鑑!important／hover缺色；城堡無碰撞機關誤用石柱貼圖改地面印記；新掩體4Boss／5怪、2秒保護、110×range附近、實際各型攻擊、旧耐久比例遷移；鬼甲250含舊檔／三職／升血／周目／復活；Boss route條件亂數相關被大樣本確診，專流混合後九池近50%、512組合，旧journey不重抽。沒有只因猜測改家族圖案色彩。

PASS：最新版check／326unit／build；首次307舊回歸306PASS／1末瞬間斷言FAIL，修整段觀察而保留三招。衝撞反例fixture首版尚未移到接觸距離、修測試起點後PASS。4針對browser首2PASS／2測試假設FAIL（家族圖色／导入重算stats），修成稀有背景與hover、合法體魄20級後4PASS。精確雷射半寬與离牆衝撞又加兩unit後326PASS。本輪完整81Chromium正在跑，dist固定，未寫全PASS；格式補文件後收束。

本地branch implement/s00-s05、前一HEAD5856e62工作乾淨起步；實際git ls-remote與GitHub branches確認遠端同5856，origin tracking舊9f是陳舊ref而非遠端回退。沒有reset／force／merge main，舊作只讀。正式目前仍1.0.0／cc6f32e，尚未把本輪部分發布；完整回歸後保存／push既有分支、Actions deploy、正式资源SHA與新局／舊檔驗證。

使用者明示要兩個new chat的完整prompt，已準備docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md與ART_NEW_CHAT_PROMPT.md，README说明全文複製。未建立新chat或spawn agents。遊戲窗口整合兩邊與Pages；美術獨立分支／worktree，避免同時推正式分支，共享記憶以追加併入，保留当前v1与歷史。兩prompt含來源索引、所有保留體驗、新規則与五輪增量、S13真GPU／跨瀏覽器／自然人工平衡及聆听／短FX NOT_RUN、SwiftShader60FPS FAIL；不重開骨架、不冒稱全驗收。

接續直接完成81回歸、修任何失败、保存commit並發布1.0.1；更新本節與两prompt实际部署基准，保留所有歷史失敗。

## v1內容發布與驗收界線（2026-10-11 21:39:23 UTC）

版本1.0.0已發布正式[GitHub Pages](https://sces5504.github.io/Solaria-Remaster/)。部署來源cc6f32eff2ba1484e2f2b94bdf2e2565f74333bc、implement/s00-s05，原9f88061／53691bf成果接續，未force／回退／merge main。PR2仍Draft，base docs/solaria-cloud-spec。此後僅追加文件／驗證證據，最新文件commit以git log核對，不改已部署遊戲。

PASS：check／307unit／build／format；最新來源完整77Chromium三輪均成功，push 38175125184（28.5分鐘）、PR 38175128180（14.2分鐘）、[Pages 38175125134](https://github.com/sces5504/Solaria-Remaster/actions/runs/38175125134)（17.6分鐘）及deploy成功，均無flaky。正式URL兩項PASS23.7秒：新局、左右鍵同時普攻／職技、8:5、保存reload；53691bf舊IndexedDB直接繼續、構築保留、再保存reload。JS／四atlas及manifest SHA256与本地Pages bundle一致，資源無錯誤。補充舊檔實戰PASS：bow保存构築不變，W移動y320→150、普攻0→2、WebGL活躍34精靈、無pageerror，實際圖與JSON保存。

內容接入完成：九地形／29普通怪／54主題程序房型與危害／詞條／精英，18地形王各2×3招、索拉里斯三血四柱與30＋1／周目，85卡，8橘／3普通紅／6事件紅，六事件／兩事件王，收藏UI／教學／圖鑑／七成就／三外觀／音效／存檔恢復及錯誤流程。四柱60°旋轉缺口為主人明示例外；第五輪Steam、炎龍、燼火、範圍与CD全部保留。逐項核對見TERRAIN／BOSS／CARD／EQUIPMENT／EVENT_MATRIX与RELEASE_CHECKLIST；資料與回歸不代表全部逐幀人工批准。

S13尚未全驗收，不能稱本次S06–S14任務全部完成：Cloud600彈／逐傷字功能與10＋30 UI重啟JS記憶體PASS；SwiftShader密集場景平均1.3–1.5秒／幀、60FPS為FAIL。真正GPU60FPS／600彈60秒／GPU記憶體、Firefox／Safari、三職自然构築完整30＋1與人工周目平衡、人工聆聽与全部短FX逐幀核對NOT_RUN。24＋8合法預算單王探測保留一般劍1／2周目死亡，不冒稱自然全程通關。確切剩餘與恢復見REMAINING_ACCEPTANCE，平衡／硬體證據見BALANCE_PERFORMANCE。

正式站測試環境修復紀錄：首兩輪CA錯誤（未進遊戲）保留；NSS資料庫在sandbox唯讀導致Chromium無法開啟信任庫，給測試程序資料庫寫入權限後TLS正常。系統openssl驗證亦0(ok)，沒有ignoreHTTPS／停用TLS。随后1PASS／1FAIL是Node APIRequestContext不繼承HTTP_PROXY、直接Internet連線拒絕；docs/validation/tools/pages-cloud.config.ts明確使用受管policy代理，NODE_EXTRA_CA_CERTS指系統CA，完整兩項PASS。Cloud需NSS資料庫寫入權限、Node CA與代理；一般環境用原pages.config。補充舊檔工具首輪讀錯player.classId、改根層classId後PASS。保留所有失敗，未改遊戲以掩蓋。

證據results/v1-final-_-ci.log／json、v1-pages-production-pass.log／requests.json、v1-published-bundle-sha256.json、v1-pages-legacy-playing._；工具pages-cloud.config.ts／live-legacy-play.mjs。所有最新發布檢查已成功，接續只補硬體／人工與必要實測修復，勿重開第一里程碑或把剩餘驗收抹除。

## S14事件王測試時鐘修正（2026-10-11 21:07:53 UTC）

7716push的Development77全PASS，但同來源PR checks另輪75PASS／2FAIL（聖誕、萬聖三招斷言收到2），重試仍FAIL；完整log保存，不能只選成功輪。前一Pages發布取消避免部署已被取代來源，其browser log也75PASS／2FAIL。386c1d5 setup修复已推；其Pages也取消，准备包含事件測試修復的新來源。

事件測試原先等9.5秒牆鐘；固定核心與渲染分離、慢WebGL有追趕上限，牆鐘不保證模擬已到同一時刻。改等唯讀solariaDiagnostics的核心時間達原fixture+9.5秒；仍由正式RAF／AI執行，匯出attackLog每階段3種斷言保持，不改AI、不跳核心tick、不取消招式。等待上限60秒、每兩階段case180秒。首次本地誤用Pages子路徑dist搭root preview，啟動未完成而中止，不記PASS；停止瀏覽器後正常build再重測。

## M01–M09本輪核對索引

M01：IndexedDB previous交易式回退／保留damaged／提示與再保存，recovery browser PASS。M02：42／48／49／55條件加成移除無條件外溢，handoff-regressions unit PASS。M03：九地形危害与詞條機關週期實際接入；M04：rush／barrage／shield／element按角色獨立精英能力，biomes／monster-details回歸。M05：只接受burn＋ice/freeze，電暈不算冰，逐敵交替與資格回歸PASS。M06：SpatialGrid／真碰撞時間序／彈池／渲染退休池已接入，功能／Cloud JS記憶體PASS；真GPU NOT_RUN，SwiftShader密集場景不達60FPS。M07：主人明示四柱60°缺口特殊例外，GAME_SPEC和DECISIONS已記錄。

M08仍按候選分開：GAME_SPEC第358行禁止「新的主動操作」，已施放快射／延遲反擊屬原施放排程；沒有證據將其繼續判成確診Bug，保留歷史候選。凍結／麻痺欄位與不同畫面回饋已實作，地圖連通／合法出生960seed及王房100seed×4周目有回歸；這不宣稱每種極端seed皆人工走位驗收。M09旧scaffold／F／旧CD／XP等屬歷史，尾部新條文与此次授權優先；不回復舊設定，不補造批准紀錄。

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

## 第二次任務進度：地形／王核心、主線與條件卡（2026-10-11 16:07:49 UTC）

[使用者裁定] M07：四柱封印保留旋轉60°缺口，為完整圓環彈的特殊例外。已增量記入GAME_SPEC、DECISIONS與DECISION_HISTORY；不再等待此問題。

[程式事實] 八新增地形、24普通怪、六程序主題各自空間語法、機關與獨立精英能力；十六新增地形王各兩階段三招／分裂／召喚／回血及專屬布局已接入。原創336怪物／地形影格、102王影格（含索拉里斯）。仍有部分普通怪細節與招式特效品質待完善，不能標記S06/S07完成。

[程式事實] S08已接30+1房、六段seed分支／周目保留構築、三血條18000/22000/28000、四柱1500×周目倍率、封印12彈與60°旋轉缺口。過量不跳血／柱無吸血無殺敵獎勵／COMBAT舊草原檢查點保留模板與王。最終專屬美術、完整遊玩和平衡仍需驗收。S09目前69卡（新增60–69）；70–85尚未實作，S10/S11/S12/S13/S14未完成。

[驗證] 最新核心215unit PASS，check/build PASS，format:check修復boss atlas索引及新增測試格式後PASS。上一個42Chromium（八地形+十六王+既有流程+壞檔）PASS；此結果屬主線與69卡接入前bundle。新版46Chromium正在跑，尚不可聲稱全過。較早重疊Playwright產生混合日志及輸入競態，已停止本工作程序、使用獨立log、匯入等待成功再繼續。讀畫面找到回主畫面後roomKey未失效導致底圖不重繪，已修，仍待新版目檢。

[驗收界線] 正式Pages仍第一里程碑53691bf，本輪未部署。S06–S14全部尚未階段驗收。實機GPU60FPS、600密集彈、10restart記憶體、Firefox/Safari、人工正常／強構築1/2/5/10周目均NOT_RUN，不以核心／headless取代。

[恢復] /workspace/Solaria-Remaster，implement/s00-s05，最新提交以git log為準；依現有修改續作，不重置。Node24，npm_config_cache=/tmp/solaria-npm-cache，PLAYWRIGHT_BROWSERS_PATH=/tmp/solaria-browsers，網路與localhost測試使用executor network capability。新版測試/tmp/solaria-current-browser.log、215unit /tmp/solaria-unit-215.log；臨時日志不是永久證據，提交前將摘要入庫。原規格與历史保留，下列較早本轮斷點均已被本節更新覆蓋。繼續逐怪精準行為、專屬特效、剩16卡／17特殊裝備／6事件／UI保存錯誤／平衡效能／Pages；不用再問逐階段繼續。

## 第二次任務已正式啟動（2026-10-11 15:35:32 UTC）

[使用者明示] 本 Chat 正式授權由遠端 implement/s00-s05 HEAD 接續全部 S06–S14；舊等待／只備份限制僅為歷史。已核驗 clean 工作區（原 work scaffold），安全 fetch 並建立 implement/s00-s05 checkout，HEAD 9f88061；不回退、不改 main、不推舊作。已讀交接與正式規格及尾部修訂；Draft PR #2已附到本 Chat。

[驗證紀錄] 新 Cloud Node24：原遊戲 128unit、17Chromium基線 PASS。setup首次 npm 預設 cache 不可寫，改 npm_config_cache=/tmp/solaria-npm-cache 與 PLAYWRIGHT_BROWSERS_PATH=/tmp/solaria-browsers 後成功，未改 package-lock。網路命令需 executor network capability（with_additional_permissions），未繞過代理。localhost 瀏覽器 preview 同樣需要此 capability。

[程式事實] M01已加交易式 previous 回退、damaged 保存、遞增 revision 與使用者提示；真 Chromium回退／再保存／profile／重載 PASS。M02刪掉條件卡42/48/49/55的無條件普攻升級外溢；M05只接受冰霜／冰凍、逐敵交替冰火；新增條件對照 PASS。

[進行中，未驗收] S06八地形資料／程序空間語法、24普通怪／機關／精英能力與336原創擴充atlas影格已接入；167unit及check/build PASS，八地形與既有流程完整26Chromium正在跑。正常新局仍停五房，尚未接入S08主線；不得宣稱S06/S07或完整v1已完成。八地形美術目檢與招式細節仍要續修。

[待使用者必要核心澄清] M07已透過非阻塞問題詢問：最終四柱封印12彈、60°缺口是否被後續完整圓要求覆蓋；其他獨立工作持續。S07十六王、S08最終／周目、S09後26卡、S10特殊裝備、S11六事件、S12 UI／保存完整流程、S13平衡效能、S14正式v1均未完成。既有正式Pages仍第一里程碑版本，尚未推本輪改動。

NOT_RUN保持：實機GPU60FPS、600最密有效彈、10restart記憶體、Firefox/Safari、人工完整31房三職一般／強構築與1/2/5/10周目。下一步：完成八地形畫面目檢與普通怪精準行為、接入各Boss專屬布局／六招，然後依相依自動續作；不等待逐階段「繼續」。

## 使用者確認第一里程碑完成與跨 Chat 第二次任務（2026-10-11 15:11:21 UTC）

[使用者明示] 主人確認：「ok第一里程碑完成，相當於遊戲的整體骨幹已經完成」，決定自行開新 Chat，要求完整交接 Prompt，包含依 CLOUD_START_PROMPT 第二次任務自主完成全部 S06–S14、完整 v1 與 GitHub Pages 網址的原始指令。舊「現在只是備份／等待第一里程碑試玩／不交接」是當時限制，已被本次新指示取代；保留作歷史，不能讓新 Chat 因舊文停工。本 Chat 現在只整理及保存交接，不開始第二次實作，也不代替主人建立新 Chat。

[使用者明示] 「蒸汽爆炸的特效做得非常好，希望之後可以保持這種水平。」這是對此特效的明確正面驗收與後續特效品質基準，不等同使用者已確認每個招式或全部硬體驗收。後續依各技能設計保留此等動態、亮光、層次與命中可讀性。

最新遊戲成果仍 `53691bf925df3c39a5f20613ff7acdba900b1bb7`；交接前文件提交 `bce48333caac91a757c051b2f4035692bd17086e`，此後交接文件提交看實際git log。最新起點是遠端 `implement/s00-s05` HEAD，不能回退到空main或原始規格分支。正式網址 https://sces5504.github.io/Solaria-Remaster/ ，既有 Draft PR #2仍未merge。128unit／17Chromium與線上驗證證據沿用上述遊戲版本，未重新跑新遊戲測試；M01–M09及NOT_RUN保持原分類，不因里程碑主觀接受自動解決。

完整可貼交接指令：[NEXT_CHAT_PROMPT.md](NEXT_CHAT_PROMPT.md)。內含來源、文件讀序、五輪修訂、S06–S14範圍、質量門檻、已知問題、Pages分支限制與持續記憶。新 Chat 收到主人貼上該Prompt後正式執行第二次任務，並按實際repo／最新狀態安全續作。

備份時間：2026-10-11 14:22:09 UTC。來源基準：`a1543a07484ef230e8d694e9c0b75e5ae2f5ede9`，分支 `implement/s00-s05`。

**初次備份時的歷史限制（已被本頁最新跨 Chat 任務取代）：這是長期記憶備份，不是當時交接、結束合作、重啟專案或啟動下一個開發任務。** 初次備份只整理文件、未改遊戲；之後授權的遊戲修訂與最新工作狀態見後續增量及CURRENT_STATE，不能將初次備份限制套到新任務。

可信度標籤：**[使用者明示]**＝目前仍可取得的使用者原話／需求；**[正式規格]**＝根目錄確認檔案；**[程式事實]**＝此基準版本的實作；**[驗證紀錄]**＝已有測試或部署證據；**[待確認]**＝衝突／未決；**[歷史資訊不足]**＝不能還原，禁止補造。程式與 AI 撰寫的驗證檔案不能單獨證明使用者曾確認某項設計。

權威順序：後續使用者明確指示優先於被取代的舊條文；玩法／數值看 GAME_SPEC，呈現看 UI_UX_SPEC，模組看 ARCHITECTURE。記憶檔案是恢復上下文的索引與歷史記錄，**不取代正式規格**。根檔案中的舊條文及本次附錄應按時間／覆蓋範圍解讀；不因儲存舊文而恢復舊設計。

**最後更新時間：2026-10-11 16:27:16 UTC。** 以後每次改本檔案更新此欄位，並同步MASTER概要；過時狀態標取代，不抹歷史。

## 1. 當前任務與實際儲存

目前任務是使用者要求的第一里程碑最後九項修改：世界光影、扇形噴火、燼火爆炸加3層、三場域略縮、強光藍雷、冷卻條越界、.2秒蒸氣三波與普攻命中效果、低於4快速補有限怪、石門黑邊。實作已加入並通過128項unit及型別／build；17場景首輪16通過，fixture重複接受匯入確認已修，新增2項及最後2個舊元素場景重跑通過；正式CI128unit／17Chromium與Pages發布全數通過；正式網址操作／存檔與額外兩視覺場景已通過。S06–S14仍未開始，主人試玩後再告知下一步。此時不可將下面備份基準的舊驗證當成新版本全部已通過。

上一任務六份長期記憶已於88954be8f26ba5eb6cb0e997d7f704712911c08d建立並推送，來源快照仍為a1543a0；原文附錄保留不重寫。此輪允許修改遊戲，原「只整理文件」限於上一輪備份，已被當前新授權取代。分支仍implement/s00-s05，保護main與原作。

## 2. 遊戲進度與功能邊界

| 系統             | 實現/驗證狀態                                                                                    | 不能推論                                      |
| ---------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| S00–S05 playable | 三class、四草原房、六主題seed生成、隨機兩王、59卡、兩元素+三融合、基本gear、settle/save、音效/UI | 不代表TEST_PLAN全矩陣與所有靜態規範差異已清零 |
| 輸入操作         | 真左右並按、Eloot/door、clearattack、失焦/pause、8:5無scroll有回歸                               | 不代表所有瀏覽器／裝置已通過                  |
| Boss與普通怪     | 兩王各兩相三招、warn/caps/navigation/cover；unit觀察                                             | 非人類三class普通/強構築完整五房實戰          |
| 成長             | 房預算首段Lv6、31房Lv26數學證明                                                                  | 後25房未做，31房不可能已完整遊戲試玩          |
| 選擇／圖鑑       | 每組三選一一次refresh、儲存、59原創art與unknown/discovery跨run                                   | 後26卡／achievement／outfit未做               |
| 最新FX/範圍      | 粗鏈雷、雷/爆/ice/stun區分、rangehelper、CD5/6/3、instantbug回歸                                 | 視覺主觀最終滿意待主人試玩，未來招式未做      |
| 測試按鈕         | 音量左/59真實grant/前置/換職換元素/reload有unit/browser/online                                   | 正式版永久保留及成績分離未確認                |
| 儲存             | IndexedDB/entry/current/revision/export/import/discovery，真browser重新載入                      | 損壞自動fallback未實現到規格要求；不是雲同步  |
| 橘紅裝備         | 渲染可明顯光束；能力未做                                                                         | 不能因光柱支援稱S10完成                       |
| S06–S14          | 未開始                                                                                           | Pages提前交付不是正式v1S14完成                |

## 3. Git／部署證據

- 規格起點docs/solaria-cloud-spec：6399276。備份基準HEAD：a1543a07484ef230e8d694e9c0b75e5ae2f5ede9，文件確認最新發布。
- 前輪遊戲（備份時）：061e7ee30766c2b1583aed775ff1c5f8331f221d。
- draft PR [#2](https://github.com/sces5504/Solaria-Remaster/pull/2)，base docs/solaria-cloud-spec；未merge main。本次不是正式handoff PR。
- 正式試玩：[GitHub Pages](https://sces5504.github.io/Solaria-Remaster/)。使用者設public、GitHub Actions Source、github-pages允許implement/s00-s05與main，權限歷史阻塞已解決。
- 遊戲釋出 [Pages run38143596680](https://github.com/sces5504/Solaria-Remaster/actions/runs/38143596680)：build/deploy success，119unit/15Chromium。後續只有docs的push可觸發同遊戲再build，不代表新玩法；已唯讀核對a1543a0檔案提交的[Pages run38144054700](https://github.com/sces5504/Solaria-Remaster/actions/runs/38144054700)也completed/success；它是相同遊戲的檔案提交，不是新玩法。後續memory提交CI結果仍須實讀，不能提前假定通過。
- 舊Sites不是當前交付，不繼續部署。遊戲原始碼與網站都已授權可公開，但仍不寫任何認證祕密。

## 4. 已執行驗證與NOT_RUN

[已有驗證紀錄，來源PROJECT_STATUS/CI/測試原始碼] Node24的check/build/format；119unit；15Chromium最終CI整組；最後柔光/分岔與文案針對3場景；正式URLHTTP200/hash/WebGL/left+right/scale/save/loot/background/pause/catalog/reroll/test/reload，0pageerror/0HTTPfailures。先前整體跑15兩輪並完成最後受影響3回歸。正常HP三classseed23首房控制器可清，不用免傷／改怪HP，只代表固定種子首房。

**NOT_RUN：** 實體GPU60FPS、最密600敵彈有效傷害與完整組策略、2000粒子實測、10restart記憶體分佈、Firefox/Safari、人工三class完整一般與強構築五房、全部v1內容/31房/周目1/2/5/10平衡與40–60分鐘耗時。不能將headless/軟體WebGL/build綠燈改成這些PASS。此次記憶整理是Markdown-only，不重新跑遊戲驗證去創造虛假的新功能驗收；格式與索引另有本次文件檢查。

## 5. 本次審閱發現的衝突與候選問題（只記錄，沒有修程式碼）

| 編號 | 狀態/來源                                          | 具體差異                                                                                                                                        | 後續處理                                                                                             |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| M01  | 確定靜態衝突：GAME_SPEC儲存條文 vs checkpoint.load | 規範損壞回上有效版本並提示；實際驗證previous、設entry/revision後throw「前一份仍保留」，未返回有效run/替換latest                                 | 優先補明確fallback與保護profile測試；這次不修改也不宣稱恢復PASS                                      |
| M02  | 確定靜態差異：卡42正式 vs skills.basic             | 規範45內條件＋30%，重複增此條件輸出；basic把卡42每多級+.15加到全普攻。只持Lv2卡42、60距離無條件卻基傷30→34.5（忽略其他bonus），屬於條件外也加傷 | 將條件升級與相關基本升級分開回歸；尚未瀏覽器重現，不擅把多加傷當確認設計；48/49/55有類似實現需逐卡查 |
| M03  | 已查程式碼未見完整落實：詞條7地形危害              | 規範機關週期−20%，當前未見modifier index6實際改變機關排程                                                                                       | 明確當前草原機關支援範圍，寫規則測試與機制驗收，不能預設S03所有條文已實現                            |
| M04  | 部分實現：精英                                     | HP×2.5/傷×1.4與覺醒有程式碼；正式精英另外抽角色適配rush/barrage/shield/element未見完整獨立能力抽取                                              | 逐敵資料與精英行為核驗，不把elite標誌等於能力完整                                                    |
| M05  | 確定靜態目標資格差異：共振40                       | 規範burn＋ice/freeze；程式用burn且iceUntil或controlUntil，電麻痺也會符合、無冰可觸發                                                            | 後續單獨burn+stun與burn+ice測試；按全域時間交替仍需核對，未實測亦未修                                |
| M06  | 架構計劃未全實現                                   | 陣列/子步不等於空間grid與按碰撞時間穩定ID排序，全部物件池/600整組延遲/裝飾預算沒有完整效能證明                                                  | S13前依實測最佳化，不刪有效攻擊或傷字                                                                |
| M07  | 明確潛在設計範圍衝突：舊最終seal vs新使用者        | 正式最終封印12彈60°gap；後續使用者說boss完整圓                                                                                                  | 到S08確定新版要求是否覆蓋特殊封印；現在不能擅覆蓋／重複問已解決草原完整圓                            |
| M08  | 驗證邊界/候選                                      | 已排程counter/rapid更新是否遵控制、玩家freeze/stun可選欄位顯示、spawn100retry安全與Boss半徑36路徑                                               | 需證據再定義bug；不把未跑猜測寫已發生或使用者意圖                                                    |
| M09  | 文件已過時                                         | rootAGENTS/TEST_PLAN稱scaffold、舊F/CD/XP/cap/王HP等                                                                                            | 新使用者＋尾部修訂明確已取代，記錄歷史而不重新質疑已確認E/CD等                                       |

M01/M02/M05是程式碼與規格的靜態對照；不代表此次修復或新增測試通過。M03/M04是審閱未見完整實現的缺口，需要追蹤，不擅刪正式需求。M07是今後新增內容的設計範圍待確認，不阻塞當前memory任務。完整計劃的未實現內容是scope未開始，不一概稱「違反規格」或假裝已放棄。

## 6. 下一步與需要確認事項

記憶備份完成後繼續本對話，等待／執行使用者下一項遊戲任務，不自動切換正式handoff或重開。若主人要繼續第一里程碑質量，優先根據最新試玩反饋與M01/M02/M05證據做最小修復與對應回歸，再考慮M03/M04缺口；不能現在借記憶任務擅做。

若下一任務是第二次正式全v1交付，從現有分支接續，不重做S00–S05、不重建舊作。S06/S07逐八地形與16王→S08最終31/loop→S09後26卡→S10特殊gear→S11六事件→S12完整UI/儲存遷移→S13平衡/實機→S14正式Pages，保留59卡/草原/多鍵/source/save/FX回歸。所有依賴節點自主連續做完，不逐階段問繼續。

需明確但不在本次提問：M07最終缺口範圍；測試工具正式版保留/測試資料計入profile/成績；靜態衝突若發現原規則實際已被別處使用者推翻需提供來源，不能自猜。硬體驗收裝置可用性在實際S13時處理，不讓記憶任務停等裝置。一般授權數值不用重問原許可。

## 7. 歷史資訊不足

完整訪談與總審查逐字、早期已否決選擇的全部原因、原作所有細節、所有未提交過程、舊截圖原檔案及任何未執行實機資料不能還原。當前可儲存的是仍可見使用者四輪反饋、原正式9檔案、當前程式碼/Git/CI紀錄。不作「完整恢復全部舊對話」保證。未來恢復時如需要失落細節，明確標不足並檢索可取證檔案／git後再問，不能補造。

## 8. 持續更新檢查單

新重大決策：PROJECT+DECISION（理由/被取代/來源）；新重要bug/架構/里程碑：DEVELOPMENT+CURRENT（原因/修復/測試/NOT_RUN/commit）；新使用者偏好：USER（只證據）；更新CURRENT UTC與MASTER摘要/連結。保留本文歷史或遷移到DEVELOPMENT，不刪除衝突條目而應標已解決＋證據。在結束階段或預計壓縮及時寫，無法保證系統壓縮前必有機會；不因記憶維護暫停主要授權開發。

## 來源完整性清單

以下備份前root正式檔案原文均在另三份memory附錄儲存。雜湊用於核對來源版本，不聲稱排版後的附錄位元組與原文完全相同。

| 原檔案                | SHA256                                                             | 快照位置                                         |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| GAME_SPEC.md          | `7650c6f839ddef781688972b98ecdf1a807256d3d4f9d82ff42d922b9d1cf234` | [PROJECT_MEMORY.md](PROJECT_MEMORY.md)           |
| ARCHITECTURE.md       | `719b15fff4eaa3151bb90dd3510865b4072335028fc4e3484e6bc1f71ab9eb68` | [PROJECT_MEMORY.md](PROJECT_MEMORY.md)           |
| DEVELOPMENT_PLAN.md   | `25983e894eef631aabdeadec8a33f4283ddd7369317769ea4e932bf50d8526a5` | [DECISION_HISTORY.md](DECISION_HISTORY.md)       |
| DECISIONS.md          | `563b8fd2f6c204af7890b1eef1ac75735baeb648af5625d4dcccba67031f438c` | [DECISION_HISTORY.md](DECISION_HISTORY.md)       |
| UI_UX_SPEC.md         | `26043bff3890719332445234611721a6097a1d2e7cdbb84fc36f474f4aeb5579` | [PROJECT_MEMORY.md](PROJECT_MEMORY.md)           |
| TEST_PLAN.md          | `f3f7697ed5e2dec92d7ca0acaf113278923b40885cc18b2296efab1438304219` | [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) |
| AGENTS.md             | `a579cfd4dd6ff389499f5dbaf1b02b8ccc5d510c7d533511da20958216894893` | [USER_PREFERENCES.md](USER_PREFERENCES.md)       |
| PROJECT_STATUS.md     | `59775dee829ad84aaff662a4bab588c0ed6f425a087614fcccb69690e34ae88c` | [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) |
| CLOUD_START_PROMPT.md | `5ffac813b9dd711c3a810eba7c911063dbb834223f2492eebfd490426a68635a` | [DECISION_HISTORY.md](DECISION_HISTORY.md)       |

## 本次文件整理驗證

六份記憶文件已實際建立，AGENTS／README只增補入口與維護要求；其餘原規格未改。九份來源快照於格式化前逐份比對git基準原文與SHA256一致。已執行npm run format:check，全專案Markdown／程式格式通過；本次沒有跑新的遊戲測試或變更功能，遊戲PASS沿用明確版本證據。提交與遠端保存狀態以本次最後Git操作結果及git log核對。

## 第五輪：第一里程碑最後九項修訂（2026-10-11）

來源：使用者在長期記憶備份後明確提出九項遊戲修改；完成並試玩後才會告知下一步。此授權只修改第一里程碑，不啟動 S06–S14。

1. 光影加入可重用半解析度暗部／光照圖：暮色與樹巖附近較暗、掩體投影；法杖、火焰、雷電、場域、裝備／晶體與開啟出口照亮一定範圍的地面及角色，疊加柔光。敵方預警、技能圖形、血條與HUD在暗部之上，保持可讀。裝飾光源最多64，限制的是光照而非有效攻擊；真設備60FPS仍需實測。
2. 炎龍噴射保留前方80度扇形，沿扇向外連續火舌、亮芯與火星；移除每次週期傷害附帶的圓形爆炸，傷害頻率／兩秒時間不改。
3. 使用者推翻燼火「爆炸不自行加層」：爆炸40傷後給範圍內其他存活且可受傷敵人直接+3層；達5層消耗5可接續引爆，超過5的剩層保留。為避免無限互炸，每次原始引爆的連鎖每敵最多引爆一次，已引爆者仍可收到層數，待後續合格火命中再觸發。維持爆炸不暴擊／不啟動其他無限追加、來源副鏈倍率不回滿、Boss轉場不加層。
4. 「稍微調小」具體自主數值：冰雹基半徑100→85、漩渦110→94、冰火裂域首爆及持續場130→110，仍乘玩家range。無其他範圍加成時97.75／108.1／126.5；其餘光環、基本攻擊與連鎖距離維持。視覺與命中半徑同值。
5. 雷電改強光藍0x49baff與冷白亮芯，涵蓋鏈雷／雷彈／電場／麻痺跳電／落雷；雷水混合為偏藍，取代上一版金色麻痺／雷光。麻痺仍短顫不變成冰凍。
6. 角色腳下職技冷卻條異常過長原因：冷卻已過後 `(ready−time)` 為負，進度可遠超1；修成0–1夾限，ready時永遠固定40世界像素，冷卻變更也不越界。
7. 蒸氣爆炸為施放職業技能時近／中／遠三道波，基半徑60／110／160，間隔.2秒，即0／.2／.4，每波24基傷；每敵每波一次。明顯環形蒸氣水柱、上升水滴與白霧。傷害分類仍skill、可暴擊、附水火與basicHitProxy，觸發普攻命中特效（含專注／爆裂等）；不增加basicCast計數、不把傷害同時套basic與skill。波中心維持施放位置，升級傷害與range照舊。
8. 有預備怪時活怪低於4立即補至4，不等待兩秒常規增援；死亡獎勵移除後同一tick再檢查。其他時候依4–10 encounterCap與常規兩秒增援。保留有限怪池與原ID／XP／掉落；預備落點太近或違法改到可走且距玩家>170的確定性落點，給1.2秒攻擊緩衝；預備池耗盡才允許不足4，不無限刷怪。
9. 門剩餘黑邊來源是atlas本身厚INK外框與底影：原創生成程式重畫成石色外緣、柔綠內口，移除底影。只六個門影格改動，其他atlas影格與持械肖像保留；全部102影格四角透明。更正舊驗證文字「96影格」：實際17組×6＝102，96是單格邊長，不是總影格數。

這些是後續明確使用者要求及其自主實作細化，覆蓋本文舊色彩／卡23不加層／卡33時序與命中代理／三技能半徑／慢補援條文；不改其他核心規則。

### 第五輪正式發布與線上驗證（2026-10-11 14:59:54 UTC）

- PASS：遊戲commit `53691bf925df3c39a5f20613ff7acdba900b1bb7` 已部署 GitHub Pages；[Pages run38148633408](https://github.com/sces5504/Solaria-Remaster/actions/runs/38148633408) build2分52秒／deploy11秒，兩者success；正式CI完整128unit／17Chromium全數通過。
- PASS：正式網址 https://sces5504.github.io/Solaria-Remaster/ 的Cloud Chromium實測：HTML／CSS／JS／atlas／三持械肖像／manifest／背景HTTP200，atlas與本輪SHA256一致；法師正常新局、左held＋右技能、8:5無捲動、IndexedDB保存／回入口、E裝備拾取、Pages子路徑背景、選卡刷新使用讀檔不重置、pause／catalog、測試按鈕位置及59卡搜尋／給卡／前置／能力重載，pageerror／HTTP失敗皆0。
- PASS：額外正式URL兩項視覺核驗：扇形噴火／蒸氣水柱／強光藍雷／新石門實際畫面；藍雷發光前後同地面位置亮度比較>15%，冷卻就緒100秒的腳下條不超出角色。線上首次亮度比較在頁內截圖影像解碼處逾時；改在Cloud以PIL分析同一WebGL截圖後通過，未改或放寬亮度／長度斷言，亦未修改線上遊戲。原因只定位到測試取樣步驟，不能宣稱是遊戲Bug。
- 全部102 atlas影格四角透明；逐影格RGBA差異只有六門影格，三張持械肖像內容完全不變。四角檢查不等於完整alpha邊緣審計。
- 實機GPU60FPS、600最密彈、10次restart記憶體、Firefox／Safari、人工完整五房構築仍NOT_RUN；後續S06–S14仍未開始。等待主人試玩此版後告知下一步，不自動擴張內容或另開Chat。
- 本紀錄跟隨文件提交不改遊戲；最新遊戲仍53691bf，main未合併，原作只讀。既有記憶M01–M07未因本次九項自動解決。
