"""Original procedural pixel art; no external artwork or models."""
from PIL import Image,ImageDraw
import json,os
names=['sword','bow','mage','wolf','slime','knife','archer','shaman','wolfking','goatking','tree','rock','pillar','lake','door']
size=48;img=Image.new('RGBA',(size*6,size*len(names)));meta={}
for row,name in enumerate(names):
 for frame in range(6):
  tile=Image.new('RGBA',(24,24));d=ImageDraw.Draw(tile);bob=(frame%2 if frame in [1,2] else 0)
  def rect(box,c):d.rectangle((box[0],box[1]+bob,box[2],box[3]+bob),fill=c)
  outline='#101f28';skin='#e5c19c';metal='#a6bdc3';gold='#d9b56b'
  if name in ['sword','bow','mage','knife','archer','shaman']:
   col={'sword':'#457c9b','bow':'#547e58','mage':'#736ba1','knife':'#75944e','archer':'#6b8644','shaman':'#8c665e'}[name]
   rect((6,5,16,12),outline);rect((7,4,15,9),col);rect((8,7,14,12),skin if name in ['sword','bow','mage'] else '#a6bd6e');rect((9,9,10,9),outline);rect((13,9,14,9),outline)
   rect((6,12,16,19),outline);rect((7,12,15,17),col);rect((8,13,9,16),'#b6c8b9');rect((10,18,11,21),outline);rect((14,18,15,21),outline);rect((5,13,6,17),skin)
   if name in ['sword','knife']:
    rect((18,7 if frame!=3 else 2,19,16),metal);rect((16,16,21,17),gold);rect((18,18,19,21),'#865f40')
   if name in ['bow','archer']:
    d.arc((15,5,23,19),-90,90,fill=gold,width=2);rect((19,7,19,17),'#e3ddc1')
   if name in ['mage','shaman']:
    rect((19,6,20,21),'#97734f');rect((17,4,22,8),'#96dbec');rect((19,2,20,5),'#e5f8fe');rect((5,3,16,5),col);rect((8,1,14,3),col)
  elif name in ['wolf','wolfking']:
   col='#a9bcc4' if name=='wolf' else '#c7c8c0';rect((4,9,19,17),outline);rect((5,9,18,15),col);rect((3,5,12,12),outline);rect((4,6,11,11),col);rect((4,3,6,6),col);rect((10,3,12,6),col);rect((3,10,6,12),'#516871');rect((7,7,8,8),'#fff0bb');rect((7,8,8,8),'#d97c68');rect((5,16,7,20),col);rect((15,16,17,20),col);rect((18,7,21,10),col)
   if name=='wolfking':rect((4,1,12,3),gold);rect((3,14,18,16),'#587c8d')
  elif name=='slime':
   rect((4,10,20,19),outline);rect((6,8,18,18),'#719c91');rect((8,6,16,11),'#a5c8a4');rect((7,12,9,13),outline);rect((15,12,17,13),outline);rect((11,16,13,16),'#d8ecd2')
  elif name=='goatking':
   rect((5,9,19,21),outline);rect((6,10,18,19),'#a794aa');rect((7,5,17,13),'#d7c9b8');rect((4,2,6,8),gold);rect((3,1,5,3),gold);rect((18,2,20,8),gold);rect((20,1,22,3),gold);rect((9,9,10,10),'#e77674');rect((15,9,16,10),'#e77674');rect((11,13,14,16),'#647080');rect((7,20,9,23),'#7a647c');rect((16,20,18,23),'#7a647c')
  elif name=='tree':
   rect((10,13,13,23),'#6b5846');rect((5,6,18,15),outline);rect((3,4,20,10),'#426a60');rect((6,1,17,6),'#689382');rect((7,3,11,5),'#7da68b');rect((3,11,8,14),'#385851')
  elif name=='rock':
   rect((3,10,20,21),outline);rect((5,7,18,19),'#607a85');rect((8,4,16,10),'#8fa6a9');rect((6,11,10,16),'#8fa6a9');rect((14,11,18,18),'#425b6b')
  elif name=='pillar':
   rect((7,3,16,22),outline);rect((8,4,15,20),'#8797a2');rect((9,5,11,19),'#b1bcb7');rect((4,1,19,4),'#bdbaa4');rect((4,20,19,23),'#81949a')
  elif name=='lake':
   rect((0,0,23,23),'#284757');rect((0,4+frame%3,20,5+frame%3),'#547b8b');rect((5,15,23,16),'#345b6c');rect((12,8,19,8),'#628995')
  elif name=='door':
   rect((3,0,20,23),outline);rect((5,2,18,22),'#9f8969');rect((7,4,16,22),'#1d343f');rect((9,8,14,21),'#83c6ba' if frame%2 else '#77a797');rect((8,5,15,7),gold)
  if frame==4 and name in names[:10]:
   overlay=Image.new('RGBA',tile.size,(255,140,125,80));tile=Image.alpha_composite(tile,overlay)
  if frame==5 and name in names[:10]:tile=tile.rotate(90).resize((24,12));img.paste(tile.resize((48,24),Image.Resampling.NEAREST),(frame*48,row*48+24));continue
  img.paste(tile.resize((48,48),Image.Resampling.NEAREST),(frame*48,row*48))
 meta[name]={'row':row,'frames':6,'size':48}
os.makedirs('public/assets',exist_ok=True);img.save('public/assets/solaria-atlas.png');json.dump(meta,open('public/assets/atlas.json','w'),indent=2)
json.dump({'author':'Solaria Remaster procedural artwork','license':'CC0-1.0','source':'tools/create-atlas.py','assets':['solaria-atlas.png','atlas.json'],'audio':'Original Web Audio oscillator synthesis in src/audio/mixer.ts; no third-party samples'},open('public/assets/manifest.json','w'),indent=2)
