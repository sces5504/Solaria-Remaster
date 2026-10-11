"""Original SVG dusk landscape for the menu, CC0. No external assets."""
import math, random
from pathlib import Path
r=random.Random(5504)
parts=['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900"><defs>
<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#16262e"/><stop offset=".65" stop-color="#426258"/><stop offset="1" stop-color="#a5a786"/></linearGradient>
<radialGradient id="sun"><stop stop-color="#ffe2a2" stop-opacity=".5"/><stop offset="1" stop-color="#ffe2a2" stop-opacity="0"/></radialGradient>
<linearGradient id="water" x2="0" y2="1"><stop stop-color="#618c83"/><stop offset="1" stop-color="#1a363c"/></linearGradient>
</defs><path fill="url(#sky)" d="M0 0h1400v900H0Z"/><circle cx="1010" cy="228" r="240" fill="url(#sun)"/><circle cx="1010" cy="228" r="63" fill="#ecd397"/><circle cx="1031" cy="210" r="63" fill="#263d40"/>
<path d="M0 450 130 310 270 416 410 280 590 470 730 355 880 456 1110 330 1400 440V900H0Z" fill="#2e4a48"/><path d="M0 507 240 464 470 511 690 431 880 504 1140 452 1400 505V900H0Z" fill="#23443f"/>
<path d="M0 650Q290 460 650 586T1400 570V900H0Z" fill="#1d3a35"/>
<path d="M785 540Q1000 630 830 900H1260Q1090 660 1010 560Z" fill="url(#water)"/>
<path d="M0 790Q430 595 840 785L760 900H0Z" fill="#122e2c"/>
<path d="M1140 900 1400 670V900Z" fill="#112a2b"/>
<g fill="#657d6d" stroke="#203b37" stroke-width="5"><path d="M145 670v-190l33-37h121l34 38v169h-43V489h-98v180Z"/><path d="m130 479 56-57h102l60 57-22 15-49-48h-80l-49 48Z"/><path d="M215 442v-35h32v35Z"/></g>''']
for layer,base,color in [(0,565,'#284941'),(1,700,'#173b33'),(2,830,'#0d2827')]:
 for i in range(13):
  x=i*118+r.randrange(-50,50)
  if 840<x<1200:continue
  h=r.randrange(85,160)+(50 if layer==2 else 0);y=base+r.randrange(-30,30);w=h*.35
  parts.append(f'<path d="M{x-5} {y}v{-h*.65}h10v{h*.65}Z" fill="#263b33"/><path d="M{x} {y-h}l{-w*.55} {h*.3}h{w*.25}l{-w*.5} {h*.3}h{w*.2}l{-w*.4} {h*.24}h{w*2}l{-w*.4} {-h*.24}h{w*.2}l{-w*.5} {-h*.3}h{w*.25}Z" fill="{color}"/>')
for i in range(100):
 x=r.randrange(1400);y=r.randrange(620,900)
 parts.append(f'<path d="m{x} {y} 3-7 3 7" stroke="#7b9870" fill="none" stroke-opacity=".25"/>')
for i in range(45):
 x=r.randrange(100,1350);y=r.randrange(140,850)
 parts.append(f'<circle cx="{x}" cy="{y}" r="{r.choice([1,1,2])}" fill="#e2d899" opacity="{r.uniform(.1,.55):.2f}"/>')
parts.append('</svg>')
Path('public/assets/twilight.svg').write_text(''.join(parts))
