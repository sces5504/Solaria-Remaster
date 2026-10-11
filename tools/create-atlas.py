"""Original hand-authored polygon pixel sprites, CC0. No downloaded artwork.
96px tiles, six poses: idle, left/right stride, attack, hurt/channel, fallen.
"""
from PIL import Image, ImageDraw
import json, math, os, random
names=['sword','bow','mage','wolf','slime','knife','archer','shaman','wolfking','goatking','tree','rock','pillar','lake','door','heal','xp']
S=96; atlas=Image.new('RGBA',(S*6,S*len(names))); meta={}
INK='#11232b'; GOLD='#e6bf75'; CREAM='#fff2c7'
for row,name in enumerate(names):
 for frame in range(6):
  tile=Image.new('RGBA',(64,64)); d=ImageDraw.Draw(tile)
  bob=(frame%2 if frame in (1,2) else 0)
  def poly(pts,c): d.polygon([(x,y+bob) for x,y in pts],fill=c)
  def box(b,c): d.rectangle((b[0],b[1]+bob,b[2],b[3]+bob),fill=c)
  def ell(b,c): d.ellipse((b[0],b[1]+bob,b[2],b[3]+bob),fill=c)
  def line(pts,c,w=1):d.line([(x,y+bob) for x,y in pts],fill=c,width=w)
  if name in ['sword','bow','mage','knife','archer','shaman']:
   hero=name in ['sword','bow','mage']; mage=name in ['mage','shaman']; bow=name in ['bow','archer']
   col={'sword':'#608b9b','bow':'#64805f','mage':'#8273b5','knife':'#76965e','archer':'#898c59','shaman':'#987179'}[name]
   light={'sword':'#b8cdd0','bow':'#a4b986','mage':'#c1ade4','knife':'#b3c289','archer':'#c9c78b','shaman':'#ceb69d'}[name]
   skin='#e7c5a0' if hero else '#a6bb7e'
   ell((15,50,48,59),(7,22,30,130))
   # Long scarf / mantle, articulated feet and layered pauldrons.
   poly([(18,25),(36,24),(44+(frame%2)*3,51),(31,46),(20,52),(14,42)],INK)
   poly([(20,26),(34,26),(40,47),(28,44),(18,48)],col)
   box((22,45,28,55+ (2 if frame==1 else 0)),'#34414f');box((33,45,39,55+(2 if frame==2 else 0)),'#34414f')
   box((21,54,30,57),'#9b8768');box((32,54,41,57),'#9b8768')
   poly([(19,29),(39,29),(41,44),(35,48),(21,45)],INK)
   poly([(22,29),(36,29),(38,42),(30,45),(22,41)],col)
   poly([(22,30),(29,31),(30,40),(23,39)],light)
   box((21,42,38,45),'#654d40');box((28,42,32,45),GOLD)
   poly([(16,29),(22,27),(24,33),(19,37),(14,34)],light)
   poly([(36,27),(42,29),(44,34),(40,37),(35,33)],light)
   box((15,35,19,43),skin);box((40,35,44,42),skin)
   # Head has readable face, hood/helmet and hair, rather than a flat rectangle.
   poly([(20,13),(27,9),(36,11),(41,17),(39,28),(33,32),(24,28),(20,23)],INK)
   poly([(23,16),(36,16),(38,23),(33,28),(25,25)],skin)
   poly([(20,15),(24,10),(34,10),(39,14),(39,19),(34,17),(24,17),(22,22)],col if not mage else '#655582')
   line([(23,13),(29,11),(35,13)],light,2)
   box((26,20,28,21),INK);box((34,20,36,21),INK);box((29,25,33,25),'#9d786a')
   if name=='sword':
    box((22,18,38,20),'#677c89');box((25,19,28,20),CREAM);box((34,19,36,20),CREAM)
    poly([(14,38),(21,35),(25,38),(24,48),(20,51),(15,47)],'#496777');line([(17,39),(20,38),(22,40),(21,46)],GOLD,1)
   if mage:
    poly([(16,14),(24,11),(29,0),(36,12),(45,16),(30,19)],INK)
    poly([(19,14),(26,12),(29,3),(34,14),(41,16),(28,17)],col);box((27,12,35,14),GOLD)
   if not hero:
    poly([(19,18),(14,16),(17,23),(21,24)],skin);poly([(39,18),(46,16),(42,24),(38,24)],skin)
   if hero and bow:
    poly([(14,27),(10,24),(7,41),(14,47)],'#655147');line([(10,26),(7,19)],CREAM,1)
   if not hero and mage:
    line([(49,18),(46,53)],'#5c453c',4);line([(49,18),(46,53)],'#ba9272',2)
    poly([(48,4),(55,13),(49,23),(42,14)],'#635e8e');poly([(48,5),(53,13),(48,20),(44,13)],'#9fdaeb');poly([(48,7),(50,13),(48,16),(47,12)],'#e8feef')
    box((44,22,51,24),GOLD)
   elif not hero and bow:
    line([(48,19),(54,24),(56,34),(53,44),(46,49)],'#493c34',4)
    line([(48,19),(54,25),(56,34),(52,44),(46,49)],GOLD,2)
    line([(48,19),(43-(frame==3)*4,34),(46,49)],'#dce7bb',1)
    line([(40,34),(58,34)],CREAM,1);poly([(57,31),(62,34),(57,37)],'#e7eed7')
    poly([(14,27),(10,24),(7,41),(14,47)],'#655147');line([(10,26),(7,19)],CREAM,1)
   elif not hero:
    poly([(46,13),(50,11),(53,14),(51,34),(47,35)],INK)
    poly([(48,14),(50,13),(51,15),(49,32),(47,33)],'#dfecec');line([(49,16),(48,29)],'#91bacd')
    box((43,34,54,36),GOLD);box((47,37,49,45),'#8e654b')
  elif name in ['wolf','wolfking']:
   king=name=='wolfking'; fur='#b0c6cf' if king else '#99aaa0'; shade='#596f7b' if king else '#586d67'; hi='#e5e6d4' if king else '#c3cdb7'
   ell((8,46,56,57),(8,19,29,145))
   poly([(13,34),(5,28),(2,17),(14,22),(20,29)],INK);poly([(12,33),(7,26),(5,20),(14,25),(19,30)],shade)
   for x in [16,27,41,49]:
    poly([(x,37),(x+6,38),(x+4,52+frame%2),(x-2,53+frame%2)],INK);box((x,40,x+3,50),shade);box((x-2,51,x+4,53),hi)
   poly([(11,30),(17,19),(30,17),(40,20),(46,15),(54,19),(60,28),(57,36),(48,41),(30,44),(15,40)],INK)
   poly([(14,30),(19,22),(31,20),(42,23),(47,18),(53,21),(57,29),(53,35),(45,38),(30,40),(18,37)],fur)
   poly([(19,23),(29,21),(40,24),(42,28),(32,26),(22,29)],hi)
   poly([(39,20),(38,7),(46,14),(49,8),(53,19)],INK);poly([(41,18),(41,10),(46,17)],fur)
   poly([(45,23),(51,22),(56,28),(60,29),(58,32),(48,32)],hi)
   box((49,23,52,25),'#ffc97a' if king else '#f1d19a');box((52,24,53,25),INK);box((57,28,60,29),INK)
   poly([(44,32),(52,34),(49,40),(43,43),(39,39),(37,42),(32,36)],hi)
   if king:
    # Distinct broad mane, moon crest, armoured back and rune collar.
    poly([(17,19),(19,9),(25,15),(27,7),(32,15),(35,9),(39,21),(32,25),(21,23)],'#d7e4df')
    poly([(17,28),(22,24),(35,25),(41,29),(36,34),(22,33)],'#426775')
    line([(20,26),(25,30),(32,30),(37,28)],GOLD,2)
    poly([(42,7),(43,2),(47,6),(51,1),(54,8),(50,11)],GOLD);box((45,7,51,9),CREAM)
    for x in [20,28,36]:poly([(x,26),(x+2,24),(x+4,27),(x+2,30)],'#bee7f1')
  elif name=='slime':
   ell((9,47,56,57),(6,23,26,135));poly([(7,46),(10,30),(17,21),(28,17),(42,21),(53,32),(57,48),(45,55),(19,54)],INK)
   poly([(10,45),(14,31),(22,23),(32,20),(43,26),(50,35),(53,47),(41,51),(21,50)],'#529387')
   poly([(15,34),(23,24),(32,23),(41,28),(44,35),(26,37)],'#97c0a1');ell((21,26,31,31),'#d3e0b7')
   box((21,38,25,42),INK);box((40,38,44,42),INK);box((28,46,34,47),'#d4e5b5');poly([(11,44),(14,36),(18,44)],'#77b4b1')
  elif name=='goatking':
   ell((9,48,57,60),(5,16,24,160))
   poly([(14,28),(25,24),(42,25),(52,32),(54,52),(45,57),(22,56),(10,49)],INK)
   poly([(17,30),(28,28),(39,29),(49,34),(49,51),(39,53),(21,51),(14,47)],'#605275')
   poly([(23,29),(34,26),(43,30),(40,47),(31,52),(24,44)],'#9682a7');line([(26,31),(33,40),(40,32)],GOLD,2)
   box((17,50,25,58),'#44374d');box((39,50,47,58),'#44374d');box((16,56,26,60),GOLD);box((38,56,48,60),GOLD)
   # Curling ram horns with multiple faceted bands.
   for sign in [-1,1]:
    cx=32+sign*15
    poly([(cx,25),(cx+sign*10,18),(cx+sign*11,7),(cx+sign*5,1),(cx-sign*3,3),(cx-sign*5,9),(cx,15)],INK)
    poly([(cx,22),(cx+sign*7,17),(cx+sign*8,8),(cx+sign*4,4),(cx-sign*1,5),(cx-sign*2,9),(cx+sign*2,12)],'#b79562')
    line([(cx+sign*4,5),(cx+sign*7,9),(cx+sign*6,14)],'#f2d99c',2)
   poly([(23,15),(32,11),(41,15),(45,24),(38,35),(32,42),(26,35),(20,24)],INK)
   poly([(25,17),(32,14),(39,17),(41,25),(35,33),(31,36),(25,31),(23,24)],'#d8c9b4')
   poly([(26,17),(31,16),(31,28),(25,26)],'#f0e3cc');poly([(31,34),(37,33),(35,45),(29,41)],'#87908b')
   box((25,22,29,24),'#ff866d');box((35,22,39,24),'#ff866d');box((29,29,35,31),'#77695f');box((31,24,33,28),GOLD)
   poly([(11,29),(19,26),(23,31),(20,36),(11,36)],'#a293aa');poly([(42,29),(49,27),(55,32),(52,39),(45,35)],'#a293aa')
   line([(53,23),(53,53)],'#796144',4);poly([(53,14),(59,21),(53,28),(47,21)],GOLD);poly([(53,18),(56,21),(53,25),(50,21)],'#efdca7')
  elif name=='tree':
   ell((9,49,57,60),(6,23,24,120));poly([(29,26),(37,26),(40,58),(33,62),(22,61),(28,53)],'#413e31')
   box((29,27,35,56),'#766045');box((31,29,33,54),'#b08e60');line([(29,44),(23,36)],'#766045',3)
   pts=[(3,28),(8,16),(18,14),(20,6),(34,1),(48,7),(48,17),(58,21),(62,35),(54,44),(42,46),(37,51),(21,48),(17,42),(5,40)]
   poly(pts,INK);poly([(x*.92+2,y*.9+2) for x,y in pts],'#315a4f')
   poly([(8,24),(16,17),(25,16),(26,8),(34,5),(45,11),(43,19),(55,26),(53,33),(43,35),(31,32),(20,36),(11,31)],'#527c60')
   poly([(17,21),(26,17),(28,10),(35,8),(42,13),(37,20),(42,27),(29,25),(25,30),(16,27)],'#78a17b')
   for b in [(28,11,34,13),(18,22,23,24),(41,26,48,28),(10,32,15,34)]:box(b,'#a5c38b')
  elif name=='rock':
   ell((4,48,60,60),(10,26,31,110));poly([(5,45),(9,25),(22,13),(39,11),(54,26),(59,47),(44,55),(20,56)],INK)
   poly([(9,43),(12,27),(24,16),(39,15),(51,27),(54,45),(42,50),(21,51)],'#647f82')
   poly([(12,27),(25,15),(39,14),(51,27),(39,33),(23,30)],'#a0b5ae');poly([(23,30),(39,33),(42,49),(22,50)],'#789696')
   poly([(39,33),(51,27),(54,45),(42,50)],'#405e68');line([(23,19),(35,18)],'#d6d5bb',2);poly([(9,43),(13,35),(21,38),(18,49)],'#658269');line([(32,34),(29,40),(34,44)],'#49636b')
  elif name=='pillar':
   ell((6,51,58,61),(9,23,34,120));box((20,10,45,56),INK);box((23,13,42,54),'#768b92');box((25,14,30,52),'#aebbb6');box((38,14,41,52),'#4c6575')
   for y in [23,34,45]:line([(23,y),(41,y)],'#4b6574')
   box((15,7,49,13),'#c7c6aa');box((19,13,45,16),'#667e89');box((15,53,49,58),'#869fa4');box((12,58,52,62),'#516b7a')
   poly([(32,23),(36,28),(32,34),(28,28)],GOLD)
  elif name=='lake':
   poly([(0,10),(12,2),(45,1),(63,12),(63,50),(50,63),(6,62),(0,49)],'#243f4a')
   poly([(2,14),(14,6),(45,5),(60,16),(61,46),(48,59),(9,58),(3,46)],'#365f70')
   poly([(8,20),(20,10),(45,10),(55,23),(56,45),(40,54),(13,51)],'#467a88')
   for y in [17,28,42,50]:line([(9+(y+frame*3)%12,y),(28+(y+frame*3)%18,y)],'#88b6b4' if y==28 else '#5b929d',1)
   poly([(2,13),(6,9),(10,10),(6,15)],'#9bab81')
  elif name=='door':
   ell((6,51,59,62),(8,17,30,140));poly([(7,60),(7,18),(17,5),(44,5),(57,18),(57,60)],INK)
   poly([(12,57),(12,20),(21,11),(42,11),(51,21),(51,57)],'#7e8580');poly([(18,57),(18,23),(24,17),(39,17),(45,24),(45,57)],'#183b49')
   if frame%2:
    poly([(21,56),(21,25),(26,20),(37,20),(42,25),(42,56)],'#427e87');poly([(27,54),(27,25),(33,22),(37,29),(34,54)],'#a4e6ce')
   box((8,55,57,60),'#b6b49a');box((9,25,16,27),GOLD);box((47,25,54,27),GOLD);poly([(30,8),(35,12),(31,16),(27,12)],CREAM)
   for y in [32,43]:line([(9,y),(16,y)],'#bbc3aa');line([(48,y),(55,y)],'#bbc3aa')
  elif name=='heal':
   ell((15,45,49,55),(8,23,30,110));poly([(20,17),(43,17),(48,23),(47,46),(42,50),(19,49),(15,43),(16,23)],INK)
   box((20,21,43,45),'#c4bb9b');box((22,18,40,24),'#eae0bd');box((24,13,38,19),'#819d83');box((29,26,34,41),'#b95564');box((24,31,39,36),'#b95564');box((20,24,23,42),'#f3e8c6');line([(27,15),(36,15)],CREAM,1)
  elif name=='xp':
   ell((20,46,46,52),(10,34,39,100));poly([(32,10),(45,27),(35,47),(23,43),(18,27)],INK);poly([(32,12),(41,27),(34,44),(24,41),(21,27)],'#4b9fb5');poly([(32,12),(31,42),(24,40),(21,27)],'#a5e6d5');poly([(32,12),(41,27),(34,44),(32,28)],'#76c8bd');line([(25,26),(28,19)],CREAM,1)
  if frame==4 and name in names[:10]:
   # Local outline highlights preserve transparent silhouette.
   mask=tile.getchannel('A');flash=Image.new('RGBA',tile.size,(255,221,171,0));flash.putalpha(mask.point(lambda a:int(a*.22)));tile=Image.alpha_composite(tile,flash)
  if frame==5 and name in names[:10]:tile=tile.rotate(82, resample=Image.Resampling.NEAREST)
  atlas.alpha_composite(tile.resize((S,S),Image.Resampling.NEAREST),(frame*S,row*S))
 meta[name]={'row':row,'frames':6,'size':S}
os.makedirs('public/assets',exist_ok=True);atlas.save('public/assets/solaria-atlas.png');json.dump(meta,open('public/assets/atlas.json','w'),indent=2)
# Selection portraits carry a weapon; gameplay atlas deliberately does not.
for row,name in enumerate(names[:3]):
 portrait=atlas.crop((0,row*S,S,(row+1)*S)).resize((64,64),Image.Resampling.NEAREST)
 pd=ImageDraw.Draw(portrait)
 if name=='sword':
  pd.polygon([(46,13),(50,7),(54,13),(51,35),(47,35)],fill=INK)
  pd.polygon([(49,10),(51,14),(49,33),(47,33)],fill='#eaf6e9')
  pd.line([(43,36),(54,36)],fill=GOLD,width=3);pd.line([(49,37),(48,45)],fill='#a88160',width=3)
 elif name=='bow':
  pd.line([(47,18),(54,25),(56,35),(53,44),(46,50)],fill=GOLD,width=3)
  pd.line([(47,18),(42,35),(46,50)],fill=CREAM,width=1)
  pd.line([(40,35),(60,35)],fill=CREAM,width=1);pd.polygon([(58,32),(63,35),(58,38)],fill=GOLD)
 else:
  pd.line([(49,18),(46,54)],fill='#ba9272',width=3)
  pd.polygon([(49,5),(56,14),(49,23),(42,14)],fill='#a9dce8')
  pd.polygon([(49,8),(52,14),(49,19),(47,14)],fill='#f5fce6')
 portrait.resize((S,S),Image.Resampling.NEAREST).save('public/assets/'+name+'.png')
json.dump({'author':'Solaria Remaster original polygon pixel illustrations','license':'CC0-1.0','source':'tools/create-atlas.py','assets':['solaria-atlas.png','atlas.json','sword.png','bow.png','mage.png','twilight.svg'],'illustrations':'Original 59 ability line illustrations in src/ui/card-art.ts; original menu landscape in tools/create-scene.py, CC0-1.0','reference':'Original Solaria observed for visual direction only; sprites independently drawn, no assets copied.','audio':'Original Web Audio synthesis in src/audio/mixer.ts'},open('public/assets/manifest.json','w'),indent=2)
