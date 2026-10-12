# 三风格原創美術選樣：生成來源

素材由 OpenAI image_gen 為本專案原創生成，不使用第三方遊戲圖源。三張透明 PNG 為 1536 × 1024、6 欄 × 4 列的單姿態樣本；原始影像完整保留在 public/assets/art-lab。SHA256 與來源版本見 manifest.json。

## 共用生成描述

```text
Create a production game sprite atlas for Solaria, a TOP-DOWN 2D action roguelike. Exactly 24 equal cells in a strict 6 COLUMNS x 4 ROWS grid on a 1536x1024 transparent PNG. No labels, no lettering, no grid lines. Each cell is 256x256; every subject stays inside its cell with at least 22px empty padding. Center every object at the center of its cell. Consistent camera: overhead three-quarter view looking down onto tops of heads and terrain, appropriate for a flat top-down arena, NOT side view, NOT isometric tile diamonds. Crisp pixel art, visible square pixels, nearest-neighbor aesthetic, no smooth painting/airbrush, no blurry outlines. Use large readable silhouette and tightly clustered shading, rich material details, top-left light. Characters face slightly toward bottom right. Everything drawn from scratch, cohesive art direction, no references to existing commercial IP. Character weapon: player mage body has NO weapon (the engine draws the single aiming staff).
Strict cell contents reading left to right:
ROW 1: (1) young ivory-haired traveler mage in cream-and-teal cape, no weapon; (2) grey woodland wolf; (3) translucent jade slime with bright nucleus; (4) imposing regal silver wolf KING with mossy gold armor and crown; (5) giant horned mountain goat KING, rugged brown fur and rune armor; (6) lush leafy moss-covered tree with visible trunk, compact upright silhouette.
ROW 2: (1) armored basalt quadruped with molten cracks; (2) fire breathing orange salamander; (3) ash-robed fire cult mage with ember eyes; (4) giant volcano FURNACE golem with square stone torso and glowing furnace mouth; (5) giant FIRE BEAST with muscular feline body and flame mane; (6) chunky dark basalt rock formation with faint molten seam.
ROW 3: (1) bone knight with ivory bones, steel armor and short sword; (2) hooded castle crossbow soldier; (3) obsidian robed sorcerer with violet glowing eyes; (4) giant skeletal REGENT KING wearing ornate black-gold armor, tall crown, huge sword; (5) giant ECLIPSE ARCHMAGE in flowing violet robes, radiant dark star halo; (6) ornate gothic stone pillar on a square readable base.
ROW 4: (1) flat FULL SQUARE grass ground texture patch, finely textured moss grass little pebbles, no large object; (2) flat FULL SQUARE dark basalt ground texture patch, subtle cracked warm stone, no lava lake; (3) flat FULL SQUARE gothic castle floor texture patch, carefully cut worn stone bricks, understated geometric inlay; (4) chunky mossy grey boulder; (5) small top-down irregular turquoise pond with thin rocky edge; (6) upright stone exit arch with luminous turquoise interior.
Each character and prop isolated on transparency, floor textures are opaque square patches centered with 22px margins. Bosses fill more of their cell than ordinary enemies. Single pose only. Put each requested cell in exactly the corresponding grid position. Strong high quality game assets, beautiful and immediately readable when reduced.
```

## 三個方向

A — Mastercraft adventure pixel: selective outlines, arranged pixel clusters, gemlike highlights, moss greens, ivory, honey gold, restrained teal magic, expressive rounded silhouettes.

B — Dark gothic engraved pixel: angular elongated silhouettes, narrow selective outlines, engraved armor and carved stone, pine/slate/antique brass/oxblood, concentrated orange and violet emissive cores.

C — Premium sculpted HD pixel diorama: reduced black outlines, volumetric planes, colored shadows, tiny pixel speculars, faceted stones, sculpted foliage, ivory/seafoam/copper palette and top-left rim lighting, crisp square pixels.

## 樣本界線

24 格順序由 src/art-lab/artwork.ts 的 names 對應；三地形、八種普通怪、六王與法師旅人。火山熔池以樣本玄岩材質與獨立像素岩岸／熔光繪製；floor canvas 只呈現既有房間幾何，不新增碰撞。

生成結果為單姿態，沒有完成逐幀跑步／攻擊素材。現有朝向、受傷、衝撞與攻擊回饋由正式渲染器運行；不把這些樣本當成完整動畫完成。主人比較實機畫面後選定方向，才展開九地形、全部敵人與完整動畫繪製。
