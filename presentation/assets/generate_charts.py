import matplotlib.pyplot as plt
import numpy as np

# Set high DPI and aesthetic styling
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# --- CHART 1: REVENUE LEAKAGE BREAKDOWN ---
fig, ax = plt.subplots(figsize=(6, 4), dpi=300)
labels = ['Delivered\nRevenue\n(97.5%)', 'Damaged / Expired\nWrite-Offs\n(~1.5%)', 'Reverse Logistics\n& Destruction\n(~1.0%)']
sizes = [97.5, 1.5, 1.0]
colors = ['#1E293B', '#EF4444', '#F59E0B']
explode = (0, 0.12, 0.12)

wedges, texts, autotexts = ax.pie(
    sizes, 
    explode=explode, 
    labels=labels, 
    autopct='%1.1f%%',
    pctdistance=0.75,
    startangle=140, 
    colors=colors,
    textprops=dict(color="#0F172A", fontsize=9, weight='bold'),
    wedgeprops=dict(width=0.45, edgecolor='#FFFFFF', linewidth=2)
)

for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontsize(9)
    autotext.set_weight('bold')

ax.set_title("Total Revenue Leakage: ~2.5% P&L Drain", fontsize=12, weight='bold', pad=15, color='#0F172A')
plt.tight_layout()
plt.savefig('chart_leakage.png', dpi=300, transparent=True)
plt.close()

# --- CHART 2: BEFORE vs AFTER IMPACT ---
fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=300)
categories = ['Return Rate (%)', 'Reverse Logistics (% Rev)', 'Shelf Freshness Index']
before = [1.5, 1.0, 62.0]
after = [0.4, 0.35, 94.0]

x = np.arange(len(categories))
width = 0.32

rects1 = ax.bar(x - width/2, before, width, label='Current Baseline', color='#94A3B8', edgecolor='#64748B')
rects2 = ax.bar(x + width/2, after, width, label='With L\'Oréal VeloCity AI', color='#C5A059', edgecolor='#9A7B38')

ax.set_ylabel('Metric Value', fontsize=9, weight='bold', color='#1E293B')
ax.set_title('Operational Impact & Efficiency Shift', fontsize=11, weight='bold', pad=12, color='#0F172A')
ax.set_xticks(x)
ax.set_xticklabels(categories, fontsize=9, weight='bold', color='#1E293B')
ax.legend(frameon=True, facecolor='#F8FAFC', edgecolor='#E2E8F0', fontsize=8)
ax.grid(axis='y', linestyle='--', alpha=0.4)
ax.set_axisbelow(True)

# Add value labels on top of bars
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, weight='bold', color='#1E293B')

autolabel(rects1)
autolabel(rects2)

plt.tight_layout()
plt.savefig('chart_impact.png', dpi=300, transparent=True)
plt.close()

# --- CHART 3: TRI-BAND THRESHOLDS MATRIX ---
fig, ax = plt.subplots(figsize=(6.5, 3.5), dpi=300)
bands = ['Green Band\n(Fast Velocity)', 'Amber Band\n(Slow-Moving)', 'Red Band\n(Near-Expiry)']
days_remaining = [365, 180, 75]
colors_band = ['#10B981', '#F59E0B', '#EF4444']

bars = ax.barh(bands, days_remaining, color=colors_band, height=0.5, edgecolor='#0F172A', linewidth=0.8)
ax.set_xlabel('Average Remaining Shelf Life (Days)', fontsize=9, weight='bold', color='#1E293B')
ax.set_title('Tri-Band Autonomous Triage Protocol', fontsize=11, weight='bold', pad=12, color='#0F172A')
ax.grid(axis='x', linestyle='--', alpha=0.4)
ax.set_axisbelow(True)

# Annotate bars
protocols = ['Normal Reorder Cycle', 'Re-anchor & B2B Bundle', 'StockSwap & Salon Liquidate']
for bar, proto in zip(bars, protocols):
    width = bar.get_width()
    ax.text(width - 15, bar.get_y() + bar.get_height()/2, f'{proto} ({int(width)}d)',
            ha='right', va='center', color='white', fontsize=8, weight='bold')

plt.tight_layout()
plt.savefig('chart_triband.png', dpi=300, transparent=True)
plt.close()

print("Charts successfully generated!")
