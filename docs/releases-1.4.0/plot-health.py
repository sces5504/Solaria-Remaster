"""Published HP curve, unmodified class/card/equipment build (Python 3 + matplotlib)."""
from pathlib import Path
import csv, math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).parent

def old(level):
    return 1 + 1.5 * ((level - 1) / 30) ** .9

def current(level):
    return old(min(level, 32)) + (0.3 * math.log1p((level - 32) / 30) if level > 32 else 0)

levels = list(range(1, 157))
with (OUT / 'health-curve.csv').open('w') as f:
    w = csv.writer(f)
    w.writerow(['level', 'multiplier', 'sword_hp', 'bow_hp', 'mage_hp', 'legacy_multiplier'])
    for lv in levels:
        k = current(lv)
        w.writerow([lv, k, 150*k, 100*k, 90*k, old(lv)])
plt.rcParams.update({'font.family': 'Noto Sans CJK JP', 'axes.spines.top': False, 'axes.spines.right': False})
fig, (ax, gain) = plt.subplots(1, 2, figsize=(13, 4.8), gridspec_kw={'width_ratios': [1.7, 1]})
fig.suptitle('Solaria 1.4.0｜等級生命成長', fontsize=17, fontweight='bold')
ax.plot(levels, [old(x) for x in levels], '--', color='#a0a6b0', label='原曲線', linewidth=1.8)
ax.plot(levels, [current(x) for x in levels], color='#297b73', label='新曲線', linewidth=2.8)
ax.axvline(32, color='#b38b51', alpha=.7, linewidth=1)
for lv in [1, 31, 32, 63, 94, 125, 156]:
    ax.scatter(lv, current(lv), s=26, color='#297b73', zorder=5)
for lv, offset in [(1, (6, 12)), (32, (-26, 15)), (63, (0, -24)), (94, (0, 15)), (156, (-42, 15))]:
    ax.annotate(f'Lv.{lv}  ×{current(lv):.3f}', (lv, current(lv)), xytext=offset, textcoords='offset points', fontsize=9)
ax.set(xlabel='等級', ylabel='相同構築的最大生命倍率', xlim=(0, 160), ylim=(.7, 8))
ax.set_xticks([1, 32, 63, 94, 125, 156]); ax.grid(alpha=.17); ax.legend(loc='upper left')
xs = list(range(2, 157))
gain.plot(xs, [(current(x)-current(x-1))*100 for x in xs], color='#297b73', linewidth=2.3)
gain.axvline(32, color='#b38b51', alpha=.7, linewidth=1)
gain.set(xlabel='升至該等級', ylabel='每級新增生命（1 等生命的 %）', xlim=(1, 156), ylim=(0, 8))
gain.set_xticks([2, 32, 63, 94, 156]);gain.grid(alpha=.17)
gain.annotate('33 等起明顯放緩\n之後每級增量持續遞減', (33, (current(33)-current(32))*100), xytext=(50, 4.5), arrowprops={'arrowstyle':'->','color':'#297b73'}, fontsize=10)
fig.text(.5,.015,'1～32 等保持原曲線；之後採對數成長。卡片與裝備倍率另計，不改動既有加成。',ha='center',fontsize=10,color='#505964')
fig.tight_layout(rect=(0,.04,1,.94))
fig.savefig(OUT/'health-curve.png',dpi=160)
fig.savefig(OUT/'health-curve.svg')
for lv in [1,31,32,63,94,125,156]: print(lv, round(current(lv),4), round(150*current(lv),1), round(100*current(lv),1), round(90*current(lv),1))
