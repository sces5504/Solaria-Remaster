# DEVELOPMENT_HISTORY — 開發、Bug 與技術記錄

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

備份時間：2026-10-11 14:20:13 UTC。來源基準：`a1543a07484ef230e8d694e9c0b75e5ae2f5ede9`，分支 `implement/s00-s05`。

**這是長期記憶備份，不是現在交接、結束合作、重啟專案或啟動下一個開發任務。** 初次備份只整理文件、未改遊戲；之後授權的遊戲修訂與最新工作狀態見後續增量及CURRENT_STATE，不能將初次備份限制套到新任務。

可信度標籤：**[使用者明示]**＝目前仍可取得的使用者原話／需求；**[正式規格]**＝根目錄確認檔案；**[程式事實]**＝此基準版本的實作；**[驗證紀錄]**＝已有測試或部署證據；**[待確認]**＝衝突／未決；**[歷史資訊不足]**＝不能還原，禁止補造。程式與 AI 撰寫的驗證檔案不能單獨證明使用者曾確認某項設計。

權威順序：後續使用者明確指示優先於被取代的舊條文；玩法／數值看 GAME_SPEC，呈現看 UI_UX_SPEC，模組看 ARCHITECTURE。記憶檔案是恢復上下文的索引與歷史記錄，**不取代正式規格**。根檔案中的舊條文及本次附錄應按時間／覆蓋範圍解讀；不因儲存舊文而恢復舊設計。

## 1. 可追溯里程碑

初始scaffold與正式規格在docs/solaria-cloud-spec建立，基準6399276授權兩次交付。implement/s00-s05接續S00–S05：檢查Cloud→Pixi與純core→三class戰鬥→草原與王→清算儲存→59卡與美術音效UI。S00–S05提交具有相同git時間，不能據此猜開發只用一秒或精確階段時長。63980aa修多鍵、地雷時序、根ID計數；隨後四輪使用者反饋對應6776b7c、83e47ca、f3689fb、061e7ee，每輪再有文件驗證提交。

當前不是重構完全部v1，也不是隻有啟動骨架。rootAGENTS／TEST_PLAN的scaffold措辭保留歷史，但已被程式碼與後續PROJECT_STATUS覆蓋。初期private部署屬於過去，正式釋出改GitHubPages；完整歷史PROJECT_STATUS附錄保留各輪數字，不能把舊88/102/107/113測試數當最新119。

## 2. Bug／失敗經歷與修復方法

| 現象／問題                   | 可確認原因                                                           | 修復／經驗與證據                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 左held右職技失效             | PointerEvents多滑鼠鍵只有初次pointerdown；render幀提前喫edge會丟tick | canvas mousedown/up各鍵；edge在實際fixedtick消耗，held持續；真實瀏覽器雙鍵／三class檢查                                              |
| 清算後不能攻                 | 原狀態分支只處理COMBAT                                               | POST_CLEAR/清算允許命令，overlay仍暫停；測試attack+E下一房                                                                           |
| 第一boss2級                  | 原單位5XP不足早期每房升級期望                                        | 房XP預算、精英權重；Lv6首段與31Lv26數值驗證，尚非全v1實戰                                                                            |
| mobs擠羣太快／首房難         | 初速度與同屏量不合早構築，directchase隊形                            | 先cap4/5後4–10有限增援、BFS快取/分離/站位、慢且鎖向警示rush；正常HP控制器三classseed23只證明首房                                     |
| 王太硬                       | 草原初6500且玩家早期弱                                               | 3600狼/4000羊，保留兩階段各三招，bossunit回歸                                                                                        |
| 同時兩武器／選角空手         | 身體固定weapon與aimweapon疊；移除身體後portrait共用                  | gameplaybody空手+動態武器；後來另作三持械portrait                                                                                    |
| 清算瞬間跳卡                 | 原即時吸入而沒有展示                                                 | deterministic1.1秒飛行，先救命/計分，checkpointsettled標防重領                                                                       |
| 無主題預製／隨機太亂         | 固定配置變體不足；均勻亂放缺語法                                     | 六seed主題羣落、wide通路/連通檢查/掩體密度與120圖測試                                                                                |
| 雷弧跨場連線                 | 圖形路徑沿用上一段                                                   | 新段明確起點，WebGL截圖檢查，不用unit斷言代替美術目檢                                                                                |
| 地雷時序不對                 | proximity/armed/trigger混合                                          | 武裝1.3秒、觸發延遲.25、到期4秒，pending trigger與時序測試                                                                           |
| 副箭／focus按每hit多計施放   | 每子彈獨立root或按命中計cast                                         | 一次cast共享rootAttackId，每敵focusRoots有界去重；副鏈scale傳遞                                                                      |
| 行星爆後續不爆               | .01瞬間視窗短於DT1/60，非整tick施放後整段被跨過                      | duration<DT、next==starts的pendingInstant跨due仍首擊一次，過期週期場不補；25連續非整點主/echo共50爆，零暴擊每次144總傷；敵瞬時雷同修 |
| range視覺與傷害不一致        | 判傷再乘range、render存基礎半徑可能錯配                              | 建立area儲存實際半徑且不二次乘；shoot/targetPoint/cone沿用helper，實際範圍與圖回歸                                                   |
| stun像freeze／slow過量冰     | controlUntil混同且iceUntil慢直接畫大殼                               | acceptedfreezeUntil/stunUntil分離，slow小霜、freeze大殼、stun金電顫，Boss拒絕control不顯示成功                                       |
| 門底橢圓／柱外方框像摳壞     | stage額外裝飾，不是PNG背景                                           | 移除flatellipse/boxedplinth；96框alpha四角檢查，僅四角不是完整alpha審計                                                              |
| FX仍太弱／平雷柱方底         | 使用者仍嫌.65與細線含蓄，試作wideflat雷柱有矩形視覺                  | .8多層炸光/火舌/碎片、粗分岔22/10/5/2.5鏈雷層、雷權重1.8與柔光而非矩形；最終WebGL回歸                                                |
| 測試給卡不應只加記錄         | 必須真實acquire並保持選擇流程                                        | sharedacquire、auto前置/class替換、合法offers、testQuery儲存、persist(true)測試入口快照；59卡與reload測試                            |
| 新profile讀檔/穿戴測試race   | IndexedDB非同步，menu存在不代表HUDready/save完成                     | 等#hud就緒與無overlay.saving再reload；不是隨便提高timeout                                                                            |
| 瀏覽器中途首頁404            | Playwrightpreview讀取dist時同時重build先刪除dist                     | build完成後固定bundle再測試；不併發改dist；非正式線上故障                                                                            |
| 400seed卡池測試>5秒          | 多次地圖生成與軟體WebGL爭CPU                                         | 改數值網格連通、降低生成成本，不放寬原測試時限；整組回歸                                                                             |
| 匯入測試新case失敗           | 覆蓋已有存檔確認dialog未處理                                         | Playwrightfixture接受預期確認，再跑；不刪產品確認功能掩蓋測試                                                                        |
| 正式URL Node API ENETUNREACH | 獨立Node請求未走Cloud代理                                            | 同源browserfetch驗證HTTP/hash；不禁TLS、不把網路誤作權限需重開                                                                       |
| gh pr edit失敗               | 舊GraphQL Projects介面退役                                           | REST PATCH結構化JSON/bodyfile，避免shell引號/newline問題                                                                             |
| Pages environment修改403     | 當時憑證不能改保護分支                                               | 使用者settings加implement/s00-s05允許，回覆已新增；已解決，無當前權限阻塞                                                            |

根原因欄只有能由修訂／git／code確認的內容；使用者抱怨但未還原機制不能編成已知原因。後續如果發現上述根因說明需修正，保留原結論並寫「已取代／新證據」，不要直接抹歷史。

## 3. 當前模組地圖（程式碼事實，不等於每項設計確認）

| 路徑                                                 | 用途與擴充套件注意                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| src/main.ts                                          | 啟動、stage/input/audio/checkpoint與DOM UI協調，saveChain排隊，saveBusy防操作，overlay signature；避免把遊戲規則不斷塞回此處   |
| src/game/core/types.ts                               | serializable Run/Player/Enemy/Projectile/Area/Context/Command；stableID與新增optional舊檔相容                                  |
| src/game/core/primitives.ts                          | DT、fixedClock、xorshift RNG/seedFor/clone/距離，暫停清accumulator，realDelta上限.1                                            |
| src/game/core/run.ts                                 | newRun/enter/step/清算XP/狀態流、救命順序/獎勵、分數、dash地形                                                                 |
| src/game/data/world.ts                               | 三class數值、五普通+兩Boss資料、四不重複route與六主題種子圖、障礙合法／連通／spawn                                             |
| src/game/data/cards.ts                               | 01–59 registry、資格/稀有、levels/因子；後26需正式加入不是虛擬授予                                                             |
| src/game/systems/geometry.ts                         | 牆/掩體/邊界、移動子步、線段阻擋、cone/beam幾何；尚非完整排序swept系統                                                         |
| src/game/systems/combat.ts                           | DamageContext、armor/shield/crit/actualHP吸血、狀態、副鏈、shoot/cone/area、投射子步與瞬間跨tick                               |
| src/game/systems/skills.ts                           | 三class/basic/counter/rapid/planet、19class、元素追加/fields/resonance/根計數                                                  |
| src/game/systems/enemies.ts                          | 快取BFS導航、個體接近/分離、敵移動預警、Boss六招輪轉/兩模式/transition/召喚/attackLog                                          |
| src/game/systems/progression.ts                      | derive/rarity/choices/reroll/acquire、XP、固定enemyID gear、bag/equip/discard、testgrant                                       |
| src/game/persistence/checkpoint.ts                   | IndexedDBlatest/previous/entry/profile、revision交易、validate/export/import；損壞回退缺口待修                                 |
| src/input/keyboard.ts                                | mousebuttonedges/held、canvas座標、鍵盤edge/失焦、輸入框不喫遊戲鍵                                                             |
| src/render/stage.ts                                  | Pixi terrain/object/light/projectile/danger/visual/text層，atlasframes、glow複用；讀state不改核心                              |
| src/render/effects.ts                                | 共用爆炸/電弧/beam/impact圖形語法，新技能繼續用並驗證清晰度                                                                    |
| src/render/feedback.ts                               | 純rendercameraoffset，最大3.5px，暫停不帶未播震動，不修改物理                                                                  |
| src/ui/view.ts                                       | menu/class/pause/build/equip/catalog/choice/test對話方塊與HUD HTML、escape、E提示                                              |
| src/ui/card-art.ts                                   | 59張原創SVG＋家族邊框，不能以共圖代替所有能力圖                                                                                |
| src/i18n/zh-TW.ts、card-copy.ts                      | 繁中與玩家能力短句；尚有main/view寫死字串，非完整i18n已遷移                                                                    |
| src/audio/mixer.ts                                   | WebAudio合成事件、音量gain，localStorage solaria-volume預設.25；無完整BGM系統                                                  |
| src/style.css                                        | responsive8:5、sidebar與rarity/pause/dialog/theme；無需滾動是關鍵回歸                                                          |
| public/assets/                                       | 原創atlas/metadata、三持械portrait、twilight.svg、manifest(CC0來源)，非舊作移植                                                |
| tools/create-atlas.py、create-scene.py               | Python/PIL生成原創sprite/背景，供再生成；不是執行時依賴                                                                        |
| tests/unit/                                          | 11個檔案119用例，規則/59cards/source/seed/path/boss/settle/grant/FX時序                                                        |
| tests/browser/                                       | 三檔案15Chromium場景，真滑鼠/DOM/8:5/save/catalog/reroll/test/WebGL截圖                                                        |
| .github/workflows/pages.yml                          | implement或mainpush，check/unit/format→Chromium→Pagesbasebuild→artifact/deploy，github-pages環境                               |
| .github/workflows/checks.yml、scripts/cloud-setup.sh | Node24Cloud安裝與原基本CI，失敗儲存test-results7天                                                                             |
| vite.config.ts、playwright.config.ts                 | 通常相對base，SOLARIA_PAGES子路徑；browserpreviewdist4173，CI一worker（非CI預設並行數未固定），headless實際GPU模式要依環境確認 |

## 4. 技術債、架構尚未達成與後續升級

完整效能架構尚非全部實裝：陣列掃描與子步碰撞，未完整穩定ID/碰撞時間排序的sweep空間索引；部分sprite/glow複用，不是所有projectile/particle/獨立傷字都已嚴格物件池；600整組延遲在敵模式前檢查但shoot也有逐彈上限返回，應完整壓力核驗是否任何路徑丟半組。沒有獨立GPU60FPS、600最密、2000裝飾預算、10重啟增長資料。不要以提效能為由偷刪有效傷害／字。

schema1限定room1–5與當前rarities/cards，需要S06–S14相容遷移後續route/loop/event/boss/save欄位；測試grant入口快照有意與普通戰鬥進度回入口不同。新score/kills、discovered、rerollUsed、freezeUntil/stunUntil是相容補欄位，不當完全無遷移風險保證。不同版本繼續舊種子會保留舊layout與XP，應建議新局體驗新平衡，不強刪舊檔。

其他技術債：主協調main很大；部分中文直寫；Mode union含impact/block/charge/thunder視效詞屬於待整理型別債；音效原型無BGM；profile只圖鑑未達成就外觀；測試工具生命週期未定；spawn100嘗試後是否始終安全、Boss36半徑可達，需更多證明。靜態發現不當已發生線上bug；CURRENT_STATE列確切衝突與優先順序。

## 5. 驗證歷史與重現經驗

最近遊戲版本061e7ee：check/build/format透過，119unit與15Chromium最終CI全透過，Cloud全15回歸與最後3個受影響場景回歸紀錄。正式URL瀏覽器驗證HTTP200與素材SHA、WebGL正常新局、雙鍵、舞臺無滾動、存檔重新載入、E裝備、選單背景／pause／catalog、reroll重新載入與測試位置/59搜尋/58迴響+29鏈/前置覺醒/reload能力；pageerror與HTTP失敗0。詳細各輪證據下文原PROJECT_STATUS，不靠此摘要把所有未來需求判透過。

命令：Node24 `npm ci`；`npm run check`、`npm run build`、`npm test`、`npm run test:browser`、`npm run format:check`。Playwright使用現有dist，必須build完再跑；同時修改dist會404。Pages `SOLARIA_PAGES=1 npm run build` 輸出子路徑，正式驗證用公開實際URL而非開發根路徑。不能用headless啟動／CIbuild代替實機FPS。測試截圖test-results被忽略、下一次可能覆蓋；線上驗證臨時指令碼在/tmp，不保證下個環境有，不能以路徑存在作長期證據。保留CIURL/commit/測試原始碼纔可追蹤。

## 6. 歷史缺口與安全

未取得早期訪談逐字、舊專案全部演變、所有玩家試玩資料、硬體量測與失敗時原始截圖；原附圖在聊天可見但未持久化為repo素材，已用描述記錄不虛稱原圖備份。現有早期原始檔與git能恢復當前確認規格，不能恢復當時所有意圖。只記錄公開repo/PR/CI/Pages與原始碼，不寫憑證、session代理認證或完整環境變數。舊作只讀參考路徑/workspace/Solaria-reference不是永遠存在保證，參考倉庫可安全只讀取得，禁止push/reset。

## 完整Git提交索引（備份時可取得）

保留原時區，不能從重複timestamp推測開發時長；只包含備份前提交，不假造之後memory的hash。

```text
a1543a0 2026-10-11T13:39:19Z docs: record radiant test-build Pages verification
061e7ee 2026-10-11T13:32:15Z fix: radiant abilities, reliable instant blasts and test card grants
5cf714f 2026-10-11T12:40:06Z Record verified combat polish and discovery release
f3689fb 2026-10-11T12:34:23Z Add combat impact, illustrated discoveries and themed meadow encounters
43d5c29 2026-10-11T12:05:01Z Record verified polish release on GitHub Pages
83e47ca 2026-10-11T12:00:25Z Polish meadow generation, settlement flow and loot readability
17b21fa 2026-10-11T11:21:53Z Record verified GitHub Pages release and online gameplay checks
6776b7c 2026-10-11T11:16:57Z Repair milestone controls, rebalance grass encounters, redraw art and deploy Pages
a5e8f71 2026-10-11T09:57:46Z Record verified private milestone deployment and review handoff
63980aa 2026-10-11T09:55:10Z Fix simultaneous input, proximity mines and per-cast source tracking; record milestone validation
71cdff5 2026-10-11T09:51:07Z S05: integrate 59 cards, original pixel art, audio and playable milestone UI
2fb9663 2026-10-11T09:51:07Z S04: add transactional checkpoints and settlement progression
c5769f4 2026-10-11T09:51:07Z S03: implement seeded grassland rooms and both two-phase bosses
72612b0 2026-10-11T09:51:07Z S02: implement three classes, collision and damage-source rules
940da46 2026-10-11T09:51:07Z S01: add Pixi v8 and serializable fixed-step simulation foundation
2427793 2026-10-11T09:51:07Z S00: verify cloud specification baseline and non-root browser setup
6399276 2026-10-11T17:17:12+08:00 docs: authorize two Cloud deliveries through first playable and full v1
2cc2e06 2026-10-11T17:06:13+08:00 docs: complete enemy parameters and record handoff validation
c15ad66 2026-10-11T17:04:02+08:00 docs: preserve current main documentation updates
f1318e5 2026-10-11T17:03:26+08:00 docs: finalize Solaria specifications and Cloud handoff
d97b219 2026-10-11T17:01:46+08:00 Update README.md
08bf730 2026-10-11T17:00:50+08:00 Update AGENTS.md
f0a1254 2026-10-11T11:34:35+08:00 Prepare clean remaster scaffold, cloud checks, and Matt Pocock grilling skill
eb77e19 2026-10-11T11:31:40+08:00 Initial commit
```

## 全部已追蹤檔案清單（備份前）

檔案會變化，以git ls-files實時核對；不包含ignored臨時截圖或認證資料。

```text
.agents/skills/grilling/SKILL.md
.agents/skills/grilling/agents/openai.yaml
.devcontainer/devcontainer.json
.github/workflows/checks.yml
.github/workflows/pages.yml
.gitignore
.nvmrc
.prettierignore
AGENTS.md
ARCHITECTURE.md
CLOUD_START_PROMPT.md
DECISIONS.md
DEVELOPMENT_PLAN.md
GAME_SPEC.md
PROJECT_STATUS.md
README.md
TEST_PLAN.md
THIRD_PARTY_LICENSES/grilling.txt
UI_UX_SPEC.md
index.html
package-lock.json
package.json
playwright.config.ts
public/assets/atlas.json
public/assets/bow.png
public/assets/mage.png
public/assets/manifest.json
public/assets/solaria-atlas.png
public/assets/sword.png
public/assets/twilight.svg
scripts/cloud-setup.sh
src/audio/mixer.ts
src/game/core/primitives.ts
src/game/core/run.ts
src/game/core/types.ts
src/game/data/cards.ts
src/game/data/world.ts
src/game/persistence/checkpoint.ts
src/game/systems/combat.ts
src/game/systems/enemies.ts
src/game/systems/geometry.ts
src/game/systems/progression.ts
src/game/systems/skills.ts
src/i18n/card-copy.ts
src/i18n/zh-TW.ts
src/input/keyboard.ts
src/main.ts
src/render/effects.ts
src/render/feedback.ts
src/render/stage.ts
src/style.css
src/ui/card-art.ts
src/ui/view.ts
src/vite-env.d.ts
tests/browser/feedback.spec.ts
tests/browser/resonance.spec.ts
tests/browser/startup.spec.ts
tests/unit/bosses.test.ts
tests/unit/cards.test.ts
tests/unit/clock.test.ts
tests/unit/feedback.test.ts
tests/unit/milestone.test.ts
tests/unit/pathing.test.ts
tests/unit/playability.test.ts
tests/unit/polish.test.ts
tests/unit/radiance.test.ts
tests/unit/resonance.test.ts
tests/unit/simulation.test.ts
tools/create-atlas.py
tools/create-scene.py
tsconfig.json
vite.config.ts
vitest.config.ts
```

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

## 第五輪驗證與技術經驗增量

- 冷卻條根因確定為ready時負remaining造成progress>1，現在0–1，單位及實際畫面掃描通過。
- 光照512×320重用canvas與Texture；暗部／掩體投影在地形和物件上、預警在其上；相同光源與場景不重上傳靜態光圖，避免暫停仍更新。64光源僅裝飾預算，不刪攻擊。
- 預備怪原本每兩秒只出一隻且太近者轉隊尾，快速清怪可長期1–2活怪；低於4同幀補有限池＋合法遠落點修復。
- 新畫面測試同test兩次fixture匯入，第一次沒有confirm卻留下once(dialog)，第二次兩handler同accept失敗；改beforeEach註冊一個handler，新增2回歸通過。亮度以WebGL截圖轉獨立2D影像取樣，非讀已discard的GPU buffer，也不向遊戲注入測試API。
- 最後128unit、型別/build/format通過；原15瀏覽器＋新增2都有通過證據，最後受影響4場景重跑通過，正式CI全17待發布驗證。

### 第五輪正式發布與線上驗證（2026-10-11 14:59:54 UTC）

- PASS：遊戲commit `53691bf925df3c39a5f20613ff7acdba900b1bb7` 已部署 GitHub Pages；[Pages run38148633408](https://github.com/sces5504/Solaria-Remaster/actions/runs/38148633408) build2分52秒／deploy11秒，兩者success；正式CI完整128unit／17Chromium全數通過。
- PASS：正式網址 https://sces5504.github.io/Solaria-Remaster/ 的Cloud Chromium實測：HTML／CSS／JS／atlas／三持械肖像／manifest／背景HTTP200，atlas與本輪SHA256一致；法師正常新局、左held＋右技能、8:5無捲動、IndexedDB保存／回入口、E裝備拾取、Pages子路徑背景、選卡刷新使用讀檔不重置、pause／catalog、測試按鈕位置及59卡搜尋／給卡／前置／能力重載，pageerror／HTTP失敗皆0。
- PASS：額外正式URL兩項視覺核驗：扇形噴火／蒸氣水柱／強光藍雷／新石門實際畫面；藍雷發光前後同地面位置亮度比較>15%，冷卻就緒100秒的腳下條不超出角色。線上首次亮度比較在頁內截圖影像解碼處逾時；改在Cloud以PIL分析同一WebGL截圖後通過，未改或放寬亮度／長度斷言，亦未修改線上遊戲。原因只定位到測試取樣步驟，不能宣稱是遊戲Bug。
- 全部102 atlas影格四角透明；逐影格RGBA差異只有六門影格，三張持械肖像內容完全不變。四角檢查不等於完整alpha邊緣審計。
- 實機GPU60FPS、600最密彈、10次restart記憶體、Firefox／Safari、人工完整五房構築仍NOT_RUN；後續S06–S14仍未開始。等待主人試玩此版後告知下一步，不自動擴張內容或另開Chat。
- 本紀錄跟隨文件提交不改遊戲；最新遊戲仍53691bf，main未合併，原作只讀。既有記憶M01–M07未因本次九項自動解決。

## 使用者確認第一里程碑完成與跨 Chat 第二次任務（2026-10-11 15:11:21 UTC）

[使用者明示] 主人確認：「ok第一里程碑完成，相當於遊戲的整體骨幹已經完成」，決定自行開新 Chat，要求完整交接 Prompt，包含依 CLOUD_START_PROMPT 第二次任務自主完成全部 S06–S14、完整 v1 與 GitHub Pages 網址的原始指令。舊「現在只是備份／等待第一里程碑試玩／不交接」是當時限制，已被本次新指示取代；保留作歷史，不能讓新 Chat 因舊文停工。本 Chat 現在只整理及保存交接，不開始第二次實作，也不代替主人建立新 Chat。

[使用者明示] 「蒸汽爆炸的特效做得非常好，希望之後可以保持這種水平。」這是對此特效的明確正面驗收與後續特效品質基準，不等同使用者已確認每個招式或全部硬體驗收。後續依各技能設計保留此等動態、亮光、層次與命中可讀性。

最新遊戲成果仍 `53691bf925df3c39a5f20613ff7acdba900b1bb7`；交接前文件提交 `bce48333caac91a757c051b2f4035692bd17086e`，此後交接文件提交看實際git log。最新起點是遠端 `implement/s00-s05` HEAD，不能回退到空main或原始規格分支。正式網址 https://sces5504.github.io/Solaria-Remaster/ ，既有 Draft PR #2仍未merge。128unit／17Chromium與線上驗證證據沿用上述遊戲版本，未重新跑新遊戲測試；M01–M09及NOT_RUN保持原分類，不因里程碑主觀接受自動解決。

完整可貼交接指令：[NEXT_CHAT_PROMPT.md](NEXT_CHAT_PROMPT.md)。內含來源、文件讀序、五輪修訂、S06–S14範圍、質量門檻、已知問題、Pages分支限制與持續記憶。新 Chat 收到主人貼上該Prompt後正式執行第二次任務，並按實際repo／最新狀態安全續作。

## 完整來源快照附錄

以下保留來源原文，包含舊敘述與後續修訂。它們不是全部同時有效；先讀本文的取代／衝突註記，再按原文件末尾修訂與最新使用者指示判讀。複本只用於防止未來遺失，日後編輯正式規格應更新原文件，不只改這份快照。來源 SHA256 是備份前原檔內容，不是本文件排版後的雜湊。

### 來源 PROJECT_STATUS.md

原文件：[../../PROJECT_STATUS.md](../../PROJECT_STATUS.md)；來源提交 `a1543a07484ef230e8d694e9c0b75e5ae2f5ede9`；SHA256 `59775dee829ad84aaff662a4bab588c0ed6f425a087614fcccb69690e34ae88c`。

<!-- SOURCE_SNAPSHOT_BEGIN: PROJECT_STATUS.md -->

# PROJECT_STATUS — 第一里程碑試玩修正版

更新：2026-10-11。起點 `6399276`（`docs/solaria-cloud-spec`），實作分支 `implement/s00-s05`；原版 `sces5504/Solaria` 僅唯讀參考（HEAD `4a07ca6`）。S06–S14 尚未開始。本次依使用者 16 項回饋改善 S00–S05，不以擴充完整 v1 取代修正第一版。

## 第一里程碑內容

三職業、草原五怪與六個模板，每局四個不重複普通房＋隨機狼王／邪惡山羊王。兩 Boss 各兩階段三招、交錯／2 秒轉場／掩體耐久；59 張卡、兩元素容量及三融合；藍紫黃裝備、三裝備欄／12 背包；IndexedDB 清算、選卡與裝備 checkpoint、匯出匯入與 revision 衝突保護。PixiJS 8.22.0 WebGL，1024×640、獨立 60Hz 核心。製作者：Mori Fang。

## 本次 16 項修正

1. 滑鼠改用 mousedown／mouseup 接收每個按鍵：左鍵已按住時的右鍵不會被 Pointer Events 的多鍵語意漏掉。技能／閃避／互動按下事件只在實際 fixed tick 消耗，避免高更新率渲染先吃掉；保存刷新不清連續輸入。
2. 三選一卡片整張背景／邊框／圖示／光暈依藍紫青黃顯色，移除以顏色名稱取代呈現的標籤。
3. POST_CLEAR 保留普攻與職業技能，暫停／選卡仍凍結。
4. 普通房總數保留 8–12（詞條另加），有限分批增援，前兩房同屏 4、後兩房 5。草原行走 74／48／65／55／45，加入個體接近角度、預先分離和不同站位距離。
5. 全新原創 96px atlas：三職業、五怪、兩領主、樹／岩／柱／水／門、補包與經驗晶體；層次輪廓、盔甲、鬃毛、彎角、衣袍與陰影。獨立重繪，未複製原作 sprites；manifest CC0。
6. 瀏覽器可用高度放大舞台，保留 8:5，不需捲動頁面；桌面側欄取代大量留白。
7. 扇形揮砍／反擊、弓弦放箭／快射、法杖蓄光／行星爆、閃避殘影、技能領域與命中／爆炸粒子。
8. 59 卡另有玩家用語描述，移除「第 5 節」「依規格」等開發文字；操作／狀態／融合名稱與關卡提示修訂。
9. E 拾取裝備／靠近右門按 E 換關；站在門口不自動離場。
10. 保留六種模板骨架，再按種子添加樹岩群、保留寬路與分支；草地花草、碎石、蜿蜒步道和岩岸，不再只用平鋪方格。敵人分散且避開掩體生成。
11. 本局分數／擊殺／XP 進度，側欄常駐實際屬性、元素與裝備。
12. 小怪預警 .7 秒、遠程 .6 秒，Boss 初次衝刺 .8 秒、連續 .45 秒；蓄力停下、鎖定方向，普通衝刺 240、Boss 310；衝撞期間不被行走 AI 改向。
13. 山羊王環彈完整 360°／16 方向，無人工缺口。普通持杖哥布林扇射缺口保留其定位。
14. 狼王／山羊王各自重新繪製，放大輪廓，附蓄力壓身／衝撞傾斜／階段光環與轉場動畫。
15. 房 XP 配額 100＋20×min(room−1,4)＋10×max(room−5,0)。前四房各升級、第五房後 Lv.6；31 房無經驗加成配額驗算為 Lv.26。召喚不給經驗，精英權重為雙份；仍用正式升級需求。
16. 可回收加色光暈、冰晶／凍結晶殼、火星／焰環／火徑、水紋／泡沫／漩渦、閃電鏈／電場、蒸氣與冰火交替效果；主副投射物透明度區分。預警與敵彈保持高層。

詳細調參前後值與最新操作覆蓋在 GAME_SPEC「第一里程碑試玩修訂」。

## 驗證

雲端 Node24，正式 Vite build、Playwright Chromium WebGL。

- PASS：check／build／format:check。
- PASS：102 項 unit（原 88 項＋14 項新增），CARD01–59、兩 Boss 各階段三招、完整環彈方向、左右鍵同施放、fixed tick 事件保持、清關攻擊、E 進門、有限增援、逐房升級／31 房配額、50 種子 AI、存檔／來源／控制等回歸。
- PASS：三職業固定 seed 23 首房正常 HP／攻擊／技能可清關，不修改敵人 HP、不開免傷；控制器用正常命令，這不等於人類完整五房平衡驗收。
- PASS：9 項 Chromium（既有 3＋新增 6），三職業真左右鍵並按並匯出狀態核驗、清關攻擊與 E 換關、整張卡片配色、1920×1080／1366×768／1280×720 舞台等比及無頁面捲動、兩 Boss 與元素場景、IndexedDB checkpoint／穿戴保存／重載。
- 實際 WebGL 截圖用於檢查光效與輪廓，並修復弧線渲染沿用前一段路徑造成跨場連線。測試截圖輸出 test-results（不提交暫存檔）。
- NOT_RUN：實體 GPU 60FPS／最密 600 彈／10 次重啟記憶體分布、Firefox／Safari、人工三職業完整一般及強構築五房／全 v1 平衡。headless 不冒充上述項目。

## GitHub Pages

使用者已將儲存庫設為 public、Pages Source = GitHub Actions，並允許 `implement/s00-s05` 部署到 `github-pages` 環境（另保留 main）。Pages 工作流程先 check／unit／format／Chromium，通過後以 `SOLARIA_PAGES=1` 建置 `/Solaria-Remaster/` 子路徑，upload-pages-artifact＋deploy-pages。

正式試玩網址：https://sces5504.github.io/Solaria-Remaster/ 。

- PASS：遊戲修正版 `6776b7c7b279bc15ffec75f1205c6fc29fc5a2f3` 已發布。Pages run [38134987440](https://github.com/sces5504/Solaria-Remaster/actions/runs/38134987440)，build／deploy 均 success；deployment `6994765136`。
- PASS：同版本 Development checks runs `38134987410`／`38134990147` 均 success。
- PASS：直接使用正式 Pages 網址的雲端 Chromium 驗證：HTML、CSS／JS、atlas／三職業肖像／manifest 均 HTTP 200；WebGL 法師新局、真實左鍵保持＋右鍵施技、舞台比例／無頁面捲動、IndexedDB 保存及重載回房間入口；pageerror 與 HTTP 失敗均為零。
- 線上檢查使用瀏覽器 fetch 驗證素材；Node 的獨立 API request 不走環境代理，首次驗證在該請求階段遇連線限制，改用瀏覽器同源請求後完整通過。
- 此文件記錄的是已驗證遊戲 commit；後續文件提交不代表新玩法版本。

Draft PR：https://github.com/sces5504/Solaria-Remaster/pull/2 ，base `docs/solaria-cloud-spec`；保留 main，沒有合併主分支。先前 Sites 部署不是本次交付，不再更新。

## 第二輪八項微調（2026-10-11）

- 主角sprite移除固定武器，只保留瞄準武器與動畫。
- 清算立即回血／計分，XP與補包吸附1.1秒後才選卡；中途checkpoint可恢復且不重複獎勵，殘留傷害保留。
- 草原與Boss房改成種子式程序生成，保留環境材質風格，增加掩體，檢查全可走格連通；普通房4–10隻初始／同屏上限。
- 狼王HP6500→3600、山羊王6500→4000；狼94、持刀88、狼王85基礎移速，史萊姆／遠程維持較慢速度，突進及預警不變。
- 地面裝備的稀有度光柱、亮芯、上升粒子、名稱與E拾取提示；門口E進入提示。完整橘紅裝備能力仍屬S10。
- PASS：107項unit（新增清算飛行／中途存檔、100種子敵群、120個種子房型連通與掩體量、Boss血量、E提示）。初次與軟體WebGL同時執行時400種子卡池測試超過5秒，改用數值網格連通檢查減少生成成本後回歸通過，未放寬原測試時限。
- PASS：check／build／format:check。10項Chromium場景：本機既有9項通過，新增清算／裝備測試補上匯入覆蓋確認處理後重跑通過；正式CI完整10項亦全數通過。

- PASS：修正版遊戲commit `83e47cab706a8d925e64f2a3d72cb947c28bad9f` 已在 GitHub Pages 發布；[Pages run 38137656597](https://github.com/sces5504/Solaria-Remaster/actions/runs/38137656597) build／deploy均success，完整107unit／10Chromium通過。
- PASS：直接正式網址雲端Chromium驗證HTML／資源HTTP200，atlas SHA256與本輪素材一致、WebGL新局、左鍵保持右鍵技能、等比無捲動、IndexedDB重載、實際地面光柱／E提示／拾取。pageerror及HTTP失敗為零。
- 本次記錄的遊戲版本為83e47ca；後續只更新驗證文件的提交不改玩法。

## 第三輪12項質感修訂（2026-10-11）

- 暴擊／重攻擊／玩家受傷／格擋及爆炸有渲染專用輕微震動，限3.5px，不改戰鬥時間或碰撞。格擋成功一次盾徽火星，衝鋒斬独立金色拖尾／前弧，普通閃避區分。
- 爆炸持續.65秒視覺事件，亮芯／衝擊波／碎片；Boss點名有預告電弧及實際雷柱，火冰水電、敵人燃燒／冰凍外觀增強。友方特效在敵方危險下方。
- 原創暮色湖岸／遺跡背景、持武器選角肖像、留白金框暫停面板、世界觀短句；59卡能力線繪圖案與家族邊框（CC0 manifest）。
- 圖鑑未知暗色不顯示卡片內容，取得後亮起；IndexedDB profile跨死亡／完成／新局保存，從舊存檔已持有卡遷移，支援匯出匯入，不增永久數值。
- 每次三選一免費刷新一次，使用狀態／抽牌保存，下一次升級重置；不改資格或稀有度抽池。
- 戰鬥也可E撿裝備入背包，穿戴仍清關。Boss彈速235、完整環彈14方向，小幅調低密度；地圖以林群／岩岸／林廊／水岸／樹庭／遺跡主題組織，仍種子生成和連通檢查。
- PASS：113unit；新增刷新限次／重載、格擋和純渲染震動、衝鋒斬、爆炸與預告雷柱、未知圖鑑／59張圖案、20種子各地圖主題，既有連通／掩體／正常HP首房／全部卡片回歸。
- 本機初次瀏覽器測試發現新profile讀取需要等待界面就緒；已加狀態等待。測試執行中重新建置曾短暫刪除dist造成首頁404，已固定建置並重跑，不視作正式部署故障。
- PASS：check／build／format:check；13項Chromium場景（完整重跑12項通過，既有穿戴存檔測試補上非同步讀取／保存等待後重跑通過）。新增背景／肖像、圖鑑跨新局、刷新讀檔限次、戰鬥拾取、爆炸／雷柱／冰火／衝鋒拖尾實際WebGL截圖；正式CI完整13項亦全數通過。實體GPU60FPS及人工完整五房構築平衡仍NOT_RUN。

- PASS：遊戲commit `f3689fbe524d39a8d2c147e23e29c0ee5f895b46` 已發布；[Pages run 38139794223](https://github.com/sces5504/Solaria-Remaster/actions/runs/38139794223) build／deploy均success，113unit／13Chromium全數通過。
- PASS：正式Pages雲端Chromium實測HTML／CSS／JS／素材HTTP200，atlas與持武器肖像SHA256一致、法師新局／左鍵保持右技能、舞台／存檔重載、E拾取、Pages子路徑背景、新暫停、刷新後讀檔維持已用、取得卡圖鑑解鎖；pageerror及HTTP失敗均零。
- 本次記錄的遊戲版本為f3689fb；後續只更新驗證文件的提交不改玩法。

## 接續範圍

S06–S14 未開始：八個新增地形／16 Boss、最終三血四柱、26 後續卡、橘紅裝備／事件／成就、周目及完整 v1 平衡。從本分支接續，保留 59 卡與草原回歸。舊存檔可讀；建議新局體驗修正版敵群與 XP 曲線。

## 第四輪七項試玩修訂（2026-10-11）

- 全職技基礎CD各減2秒：劍士5、弓箭手6、法師3。範圍基準1→1.15，連鎖雷基距120→180（未取卡實距207），不增加Boss危險範圍或改動連鎖上限／阻擋規則；場域保存實際半徑，畫面與命中範圍一致，未來內容沿用helper。
- 厚多層分岔電弧、爆炸光瓣／放射火舌／亮核／碎屑、.8秒留影，粗落雷白芯与漸層雷柱光暈；普攻斬線／友方彈道／光環加強。截圖檢查發現平直寬雷柱有矩形底色，改用沿分岔雷光的透明柔光，未保留方柱。
- 冰緩速僅輕霜，成功冰凍才冰殼；電暈金色跳電／短顫，外觀期限由實際控制接受結果決定，尊重Boss免控／遞減。新增可選欄位不使舊存檔失效。
- 音量左方「測試」，可搜尋與直接給予59張已實作卡。實際套用能力／前置覺醒，跨職業替換職業構築，元素不足容量時替換元素構築，面板明示；待選／本次刷新狀態保留。保存本房測試快照，讀檔仍保留能力。
- 行星爆失效主因：.01秒窗口短於1/60固定tick，非整點施放可能整段被跳過。瞬間場第一擊跨窗口仍結算一次，長效過期場不補傷；回響／敵方瞬間落雷亦修復。
- 移除柱外矩形地坪与門／入口平塗橢圓底色；PIL檢查96個atlas影格四角均透明，門與柱原圖無矩形底圖，未重製來源PNG。
- PASS：119unit，新增25次非整點行星爆＋回響皆爆炸且每發一次、敵方瞬間落雷與過期場、範圍與畫面一致、連鎖距離／掩體／上限、真實冰凍與麻痺／Boss免控、59卡給予与前置／換職／刷新讀檔。
- 瀏覽器：15場景首輪通過，新增測試按鈕位置／搜尋給卡／職業與元素前置／待選刷新保留／重載、冰緩速vs冰凍vs麻痺／連鎖／雷柱／爆炸及無切圖底框實際WebGL截圖。PASS：最後柔光雷柱與彈道版本完整15場景回歸通過，最後分岔輪廓與文案再針對3個受影響場景回歸，皆通過。check／build／format:check通過；發布／線上驗證待下節記錄。
- 實體GPU60FPS与人工完整五房構築平衡仍NOT_RUN；S06–S14未開始。

- PASS：遊戲commit `061e7ee30766c2b1583aed775ff1c5f8331f221d` 已發布到 GitHub Pages；[Pages run 38143596680](https://github.com/sces5504/Solaria-Remaster/actions/runs/38143596680) build／deploy均success，正式CI完整119unit／15Chromium全數通過。
- PASS：正式網址雲端Chromium核驗HTML／CSS／JS／所有素材HTTP200、atlas／持武器肖像SHA256一致、法師新局／保持左鍵加右鍵職技、舞台比例／無捲動、IndexedDB重載、E拾取、Pages背景、暫停／圖鑑、刷新讀檔仍已用；新增測試按鈕在音量左方，59卡搜尋／給予58行星回響與29連鎖雷及前置覺醒、重載仍保留能力。pageerror與HTTP失敗均零。
- 本次記錄的遊戲版本為061e7ee；後續只更新驗證文件的提交不改玩法。

<!-- SOURCE_SNAPSHOT_END: PROJECT_STATUS.md -->

### 來源 TEST_PLAN.md

原文件：[../../TEST_PLAN.md](../../TEST_PLAN.md)；來源提交 `a1543a07484ef230e8d694e9c0b75e5ae2f5ede9`；SHA256 `f3f7697ed5e2dec92d7ca0acaf113278923b40885cc18b2296efab1438304219`。

<!-- SOURCE_SNAPSHOT_BEGIN: TEST_PLAN.md -->

# TEST_PLAN — 品質、回歸與驗收

2026-10-11，CONFIRMED。此文件是測試要求，不是已運行記錄。當前遊戲仍只有startup scaffold，玩法／平衡／FPS全部未執行。

## 環境與命令

Cloud／CI使用Node24，bash scripts/cloud-setup.sh、npm run check、npm run build、npm run test:browser、npm run format:check；有有意義的核心測試後npm test。測試不用本機常開。pure simulation使用固定seed與命令trace，browser使用正式build與Chromium。renderer實際FPS另需記錄硬體GPU與瀏覽器；headless功能測試不冒充實體性能。

## 核心矩陣

| ID  | 測試行為                           | 明確通過條件                                                         |
| --- | ---------------------------------- | -------------------------------------------------------------------- |
| C01 | 按住普攻／WASD／aim／動作並行      | 無補射誤選，施放次數符定義、同敵每箭一次                             |
| C02 | dash牆／敵／湖／lava／不足落點     | 牆擋、敵穿、足夠跨、否則留原岸耗CD、無無敵                           |
| C03 | 格擋早／晚／空／多彈               | .6最短；成功後.3反擊、後.1保護；單次只一反擊，CD施放即起             |
| C04 | 快射5及升級8–10、側箭／左元素      | 每主箭推一次AA counter，副不推，右元素整次一次                       |
| C05 | 甲／盾／溢傷／受傷無敵             | 100/(100+A)，先盾，溢傷扣HP；只扣盾也開.5；DOT與雷射不能瞬疊         |
| C06 | 最後怪同幀死亡／玩家0HP            | clear只一次、先回血救回再判死，殘留彈幕持續，無免費重復獎            |
| C07 | pause／失焦／resume                | simulation／CD／status／數字／復活全部凍結，resume需新輸入           |
| C08 | 暴擊分類與100%測試                 | direct／週期暴擊，燃燒／冰矛／追加／百分比不暴擊，敵不暴擊           |
| C09 | sourceScale／鏈／代理              | 副20/.175/.15全鏈僅一次，no滿傷復原、no遞歸；星核命中不計施放        |
| C10 | ice／burn／wet／electro／Boss CC   | 15累積、刷新／不疊、wet25%；Boss共享減半／第三拒絕／2秒免疫          |
| C11 | 2元素／融合／第三元素／雙融合      | 無騰slot、舊卡仍池；最早融合／同時玩家選一次、armor正確卸下          |
| C12 | 三選一多級／稀有度／資格           | 先色再池、同組不同、選後重算、singleton不再、數值可重復              |
| C13 | 每周目cap／機制／邊際              | 5→10→15；職業機制按表，後傷1/2、1/3…非復利                           |
| C14 | 普通補包與Boss召喚                 | 2→…15、掉才重置、跨房周目、召喚15不改counter、15%回血                |
| C15 | 詞條／精英／loot                   | 無事件Boss詞、25%高色權重加算、無數量獎勵，精英生命傷及能力符合定位  |
| C16 | map／projection／beam／explosion   | 32×20連通，實體擋／低地不擋，範圍不遮蔽，高速不穿牆                  |
| C17 | Boss三招／交錯／phase              | 各階段≥3獨立attackId，2／短時3模式、預警達標、無溢傷、舊攻還在       |
| C18 | 掩體／回血召喚／眼球               | 每模式同掩體一次扣、四態；限召／noXP裝備；雙體總HP不增、皆死才清     |
| C19 | 最終封印／3血／通關                | 一二之間4柱、封印彈幕例外、字幕Mori Fang、暫停選擇／繼承             |
| C20 | ghost／友軍／lifesteal             | 3×HP／.5保護／10sec或clear復活；不擋友彈；實際HP傷吸血排盾與過量     |
| C21 | blood／禮物／星核                  | 20/10%甲無效先盾、門檻1.35繼承；gift不自爆鏈；星核AA proxy不計cast   |
| C22 | bag／equip／禁用                   | 3欄12格、F最近、滿包留地、戰鬥不開、禁armor自動卸包或地              |
| C23 | 事件計數／once／guarantee          | 0→…20每普通房推、boss不推，reset，跨周目seen不清、無詞條、clear保紅  |
| C24 | checkpoint／seeds／loss／migration | 戰鬥回入口、clear不重獎、選卡不能reroll、同ID不複製、失敗不清profile |
| C25 | HUD／字／cards／音效               | 每傷獨立、敵預警可見、CD角色旁醒目、card資訊完整，靜音保存           |
| C26 | death／profile／all-content        | 無永久數值，三職業與玩法全開，死亡只清run，newrun覆蓋確認            |
| C27 | source與asset license              | 原作只讀，無搬舊HTML／版權素材；原創atlas與license manifest可核驗    |
| C28 | Pages／base／加載／refresh         | 子路徑資源全部200，正式build能新局／保存／reload，真實部署URL有效    |

## 卡片與內容逐項覆蓋

CARD-01..85以GAME_SPEC穩定ID作為參數化案例，而非僅檢查數組長度：每卡給定合法state→取得／升級→執行其條件→斷言對應命中、數量、傷害來源、限制與無條件對照。每個案例注明關聯Cxx：數值01–14 C12/13；元素15–40 C08–13；職業41–59 C01/03/04/09/13；通用60–69 C05/08/12；橘70–77 C09/12/17；紅78–85 C11/12/22/26。紅卡測試禁用與代價、偏執與靜誓互斥，數值不只照抄函數公式。

MON-01..29覆蓋草原5＋其他8×3原生怪，測試招式／尋路／射擊／屍體掉落。BOSS-01..18每個2階段3招各獨立觀察；FINAL-01..03每條血＋SEAL4柱；EVENT-01..06每事件三波與其精英／Boss、6專紅。ROOM-TEMPLATE每地形6個、總54，驗證路和合法落點。EQUIP8橘＋3普通紅＋6事件紅分別觸發和卸下效果，不能僅寫一條總測試覆蓋所有。

分布驗收用固定大量seed統計置信區間，檢查基礎色權重、fallback正規化、稀有候選計數；不要求有限樣本精確等於百分比。查找變化的卡池時不能把有限去重樣本當成獨立概率。

## 平衡與效能

首周目三職業各至少一個一般構築和一個強構築跑30＋最終，記錄時間（排暫停）、等級、各房擊殺耗時、承傷與回血。目標40–60分鐘、20–25級，檢查不是僅最高DPS達標。第1/2/5/10周目觀察血／甲／傷曲線、最長Boss耗時、卡機制封頂；修改參數須同場景前後對照，不降低固定規則。

FPS參考設備Apple M1級或同等集顯／16GB，Chrome／Edge正式WebGL、1920×1080viewport內固定8:5、邏輯1024×640。普通房和最密Boss連續60秒，平均≥59FPS、95%幀≤20ms、不連續低55超過1秒。記錄CPU/GPU／OS／browser／resolution／render backend／scenario seed／entity與particle count／frame distribution。不寫未測達標。

壓力case包括600敵彈、12共振目標、等級5分裂＋鏈＋禮物、多個右鍵場、鬼甲與復活、最終三模式、每傷獨立數字。檢查記憶體經過10次restart不持續增長，切tab後恢復無burst。只能優化批次／池／shader／裝飾預算，不能刪有效傷害或把傷字合併。

Firefox／Safari桌面功能煙測，viewport縮放與fullscreen檢查指針準確。觸控、120FPS、多人／music／英語不作為v1必驗。

## 記錄格式

每次記錄commit、階段ID、環境、命令、結果、退出碼、失敗case、未運行項目。狀態必須區分PASS／FAIL／NOT_RUN／BLOCKED；CI綠色僅代表該workflow包含的檢查，不代表完整玩法、GPUFPS或Cloud環境已Publish。更改核心輸入／來源／存檔／掉落必跑關聯case及既有回歸。

<!-- SOURCE_SNAPSHOT_END: TEST_PLAN.md -->

## 85 卡與精準怪物行為接入（2026-10-11 17:10:38 UTC）

[程式事實] 85 張卡全部進入合格抽取池，70–85 一次性、紅卡互斥／代價／裝備限制／三元素融合選擇、雙重術式獨立副本、首段聚焦、來源吸血及封印後失效標示已接入。普通怪實際發彈數、側移、波形彈、原生＋詞條雙元素、600 全批延後與封印柱不拉扯已修，boss-telegraph／enemy-impact 分類繪製已接入。248unit PASS，check/build PASS；format:check 修正新增案例後 PASS。逐卡入口新增 docs/validation/CARD_MATRIX.md，人工逐卡／構築平衡仍 NOT_RUN。

[驗證中] 48 Chromium 正在執行，新增兩案例先因測試錯誤 FAIL：回主選單按鈕名稱誤寫、提前用尚未接入存檔格式的橘裝及徽記文案誤寫。已修案例，待完整既有回歸結束後針對兩失敗案例重跑；不重 build 改動測試中的 dist。測試 /tmp/solaria-85-browser-full.log；248unit /tmp/solaria-85-unit-final.log。未確認瀏覽器全過之前不宣稱通過。

[後續準備，尚未接入] equipment-abilities／companion 能力模組、event-content 六事件族群與兩Boss資料、create-event-atlas.py 原創13造型78影格（含禮盒、雪怪、血蝠、狂化血徒、幽魂、南瓜、外星三兵種、星塵／幼獸、霜鈴老人、南瓜災主）。不計為完整 S10/S11。血月百分比傷、南瓜吸火碰撞、卸裝、掉落品質及事件三波仍要整合。

[提交／發布] 已驗證內部檢查點 d4f54ec 在本地 implement/s00-s05；備份遠端 backup/v1-progress-2026-10-11 已推送，不觸發 Pages。正式實作遠端仍9f88061、遊戲仍53691bf。此處未發布完整v1，也未結束任務；繼續S10/S11、完整UI／音效／保存／S13／S14，勿為配合雜湊回退。實機GPU60FPS／Firefox／Safari／人工周目平衡仍NOT_RUN。

## 第二個內部檢查點：85卡回歸（2026-10-11 17:20 UTC）

256unit PASS（248實作回歸＋8未接入裝備／南瓜模組單測），check/build/format:check PASS。48Chromium先46PASS／2測試資料FAIL，修正後融合案例PASS，賭徒案例因重載後未等遊戲畫面就按I再FAIL；加入畫面就緒等待後該案例PASS12.1秒。48個案例最後全通過，不能將首次48全過當作事實。新增未引用模組後再build，全部JS檔SHA256與完整回歸bundle相同；未在任何瀏覽器測試執行中重build。永久結果見docs/validation/results。

85卡已接入，但S09仍需裝備聯動與正常／強構築平衡。已查實新缺口：GAME_SPEC第4節將扣盾定為有效受傷，當前hurt以溢出HP>0判定61/69/73，盾全擋時不觸發；下一個裝備整合修正並加實測，不把本次綠色測試當該缺口已解決。S10/S11仍未接入遊戲，獨立裝備／南瓜測試不能替代完整戰鬥驗收。

正式Pages仍原里程碑，持續完成剩餘範圍；不等待逐階段指示。源碼備份分支不觸發部署。

## 第三個內部檢查點：特殊裝備接入（2026-10-11 18:11 UTC）

實際接入17特殊裝備、掉落品質與周目新裝成長、南瓜夥伴吸火／碰撞／復甦／卸裝、百分比獨立來源、裝備特效及持久化。61／69／73扣盾受傷已修。71延遲副本改為保存各施放快照的隊列，短於.8秒冷卻不再覆蓋前一副本；副本不重扣代價、不改CD、不重計數。普通紅裝／橘裝已正常掉落；六事件紅裝能力可用，但保證事件取得待S11。

PASS：最新278unit、check/build/format。完整52Chromium曾全部PASS；後續每次有修改，以equipment／advanced-cards／last-polish針對回歸；最新9項全部PASS。實際WebGL場景目檢三裝備組合無資源錯誤；部分短暫特效截圖錯過有效時刻，不宣稱已完整逐特效目檢。獨立未接入events單測9項包含於278總數，不能算六事件已完成；sound-bank亦僅準備未引用。

驗收入口 docs/validation/EQUIPMENT_MATRIX.md；永久log docs/validation/results/_equipment_。正式遊戲仍53691bf，遠端實作仍9f88061；f322a36是前一已保存檢查點，新檢查點commit以git log核對，只推備份分支backup/v1-progress-2026-10-11，尚不部署部分v1。

接續：立即S11接入六事件三波／2王／專屬布局與FX／整局一次及存檔→S12教學圖鑑成就外觀音效保存错误→S13正常／強構築與效能／記憶體→S14完整Pages。人工平衡、硬體GPU60FPS、600真GPU、10restart真設備、Firefox/Safari仍NOT_RUN。本檢查點不是完整v1，也不等待階段指示。

## 第四個內部檢查點：六事件接入（2026-10-11 18:36:16 UTC）

六事件實際替換普通房，三有限波／兩事件王各2×3招／專屬紅裝保證／整局一次跨周目／原地形XP與難度／無普通詞條、機關全部接入。新增追蹤冰鈴提前.4秒鎖點、真正合法躍擊、軍旗附近加速／增傷及旗倒解除、禮盒／幽魂／稜光／隕星專屬彈體與事件景物；事件保存格式驗證與同房不重抽已測。普通精英盾改在最終生命詞條後配置，恢復20%最終生命。

PASS：最新295unit（288已接入遊戲／事件回歸＋4未接入profile＋3未接入碰撞／網格工具單測），check/build/format PASS。完整62 Chromium全部PASS15.5分鐘；先前9事件案例7PASS／2FAIL的原因是測試未accept第二階段存檔覆蓋confirm，已修dialog handler，完整重跑兩王2×3招及獎勵讀檔均PASS。新增未引用S12/S13模組後build的13個JS SHA256與62測試bundle完全相同。永久log見docs/validation/results/_events_。

事件與兩王实际畫面已目檢，王招式啟動紀錄每階段3種由正式核心執行驗證；這不等同逐幀特效／人工平衡／硬體FPS驗收。docs/validation/EVENT_MATRIX.md與EQUIPMENT_MATRIX.md為逐項入口。地形王仍有部分通用彈體／斬擊待補相應招式，不能把S06/S07美術全面驗收標完成。

S12準備但尚未引用：profile/records/profile-store/run-store/checkpoint-schema、journal/room-copy、SoundController；S13準備但尚未引用：collision-time/spatial-grid、boss-projectiles。特別RunStore新revision墓碑／profile備份尚未實際替代舊Checkpoints，不能宣稱已解決清除旅程的兩分頁ABA或永久紀錄壞檔。只有前三項component單測不能替代整合驗收。

前一已保存檢查點ba94447於遠端backup/v1-progress-2026-10-11。本次檢查點來源commit以git log核對，持續同備份分支保存，不部署部分v1。正式仍53691bf/Pages，遠端implement仍9f88061。接著立即S12整合UI／教學／成就／外觀／音效／保存錯誤與遷移→S07專屬FX剩餘核對→S13平衡效能→S14完整Pages。硬體GPU60FPS／600真GPU／10restart真設備、Firefox/Safari、人工構築周目平衡NOT_RUN。
