# CURRENT_STATE — 最新工作斷點

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
