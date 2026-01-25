"""
TIPZ Research PDF - Chart Generation
Matplotlib charts with TIPZ brand styling for the research document.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from io import BytesIO
from styles import CHART_COLORS

# Configure matplotlib for dark theme
plt.style.use('dark_background')
plt.rcParams['figure.facecolor'] = CHART_COLORS['background']
plt.rcParams['axes.facecolor'] = CHART_COLORS['background']
plt.rcParams['axes.edgecolor'] = CHART_COLORS['border']
plt.rcParams['axes.labelcolor'] = CHART_COLORS['text_muted']
plt.rcParams['text.color'] = CHART_COLORS['text_muted']
plt.rcParams['xtick.color'] = CHART_COLORS['text_dim']
plt.rcParams['ytick.color'] = CHART_COLORS['text_dim']
plt.rcParams['grid.color'] = CHART_COLORS['border']
plt.rcParams['grid.alpha'] = 0.3
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10


def save_chart_to_bytes(fig, dpi=150):
    """Save matplotlib figure to BytesIO buffer."""
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=dpi, bbox_inches='tight',
                facecolor=CHART_COLORS['background'], edgecolor='none')
    buf.seek(0)
    plt.close(fig)
    return buf


def create_creator_economy_growth_chart(data):
    """
    Line chart showing creator economy growth from $250B to $480B.
    """
    fig, ax = plt.subplots(figsize=(8, 4))

    years = [d['year'] for d in data]
    values = [d['value'] for d in data]

    # Historical vs projected
    historical_idx = years.index(2024) + 1

    # Plot historical (solid line)
    ax.plot(years[:historical_idx], values[:historical_idx],
            color=CHART_COLORS['success'], linewidth=2.5, marker='o', markersize=6)

    # Plot projected (dashed line)
    ax.plot(years[historical_idx-1:], values[historical_idx-1:],
            color=CHART_COLORS['success'], linewidth=2.5, linestyle='--',
            marker='o', markersize=6, alpha=0.7)

    # Fill area under curve
    ax.fill_between(years, values, alpha=0.15, color=CHART_COLORS['success'])

    # Annotations for key points
    ax.annotate(f'$250B\n(2024)', xy=(2024, 250), xytext=(2024, 300),
                fontsize=9, color=CHART_COLORS['text_bright'],
                ha='center', fontweight='bold')
    ax.annotate(f'$480B\n(2027)', xy=(2027, 480), xytext=(2027, 430),
                fontsize=9, color=CHART_COLORS['primary'],
                ha='center', fontweight='bold')

    # Styling
    ax.set_xlabel('Year', fontsize=10)
    ax.set_ylabel('Market Size ($B)', fontsize=10)
    ax.set_title('Creator Economy Growth Trajectory', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.grid(True, alpha=0.2)
    ax.set_ylim(0, 550)
    ax.set_xlim(2019.5, 2027.5)

    # Add CAGR annotation
    ax.text(0.98, 0.05, '23.3% CAGR', transform=ax.transAxes,
            fontsize=10, color=CHART_COLORS['primary'],
            ha='right', fontweight='bold')

    # Legend
    historical_patch = mpatches.Patch(color=CHART_COLORS['success'], label='Historical')
    projected_patch = mpatches.Patch(color=CHART_COLORS['success'], alpha=0.5, label='Projected')
    ax.legend(handles=[historical_patch, projected_patch], loc='upper left',
              framealpha=0.3, fontsize=9)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_fee_comparison_chart(competitors):
    """
    Horizontal bar chart comparing platform fees.
    """
    fig, ax = plt.subplots(figsize=(8, 5))

    # Filter and prepare data (exclude variable fee platforms)
    platforms = []
    fees = []
    colors = []

    fee_mapping = {
        'YouTube Super Chat': 30,
        'Twitch Bits': 50,
        'TikTok Gifts': 50,
        'Patreon': 13,  # Average of 11-15%
        'Ko-fi': 5.5,   # Average of 3-8%
        'Buy Me a Coffee': 8,
        'TIPZ': 0.5,
    }

    for name, fee in fee_mapping.items():
        platforms.append(name)
        fees.append(fee)
        if name == 'TIPZ':
            colors.append(CHART_COLORS['success'])
        elif fee >= 30:
            colors.append(CHART_COLORS['error'])
        else:
            colors.append(CHART_COLORS['primary'])

    # Create horizontal bars
    y_pos = np.arange(len(platforms))
    bars = ax.barh(y_pos, fees, color=colors, height=0.6, edgecolor='none')

    # Add fee labels on bars
    for i, (bar, fee) in enumerate(zip(bars, fees)):
        width = bar.get_width()
        label = f'{fee}%' if fee >= 1 else f'{fee}%'
        ax.text(width + 1, bar.get_y() + bar.get_height()/2, label,
                ha='left', va='center', fontsize=9, color=CHART_COLORS['text_bright'])

    # Styling
    ax.set_yticks(y_pos)
    ax.set_yticklabels(platforms, fontsize=10)
    ax.set_xlabel('Total Take Rate (%)', fontsize=10)
    ax.set_title('Platform Fee Comparison', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.set_xlim(0, 60)
    ax.invert_yaxis()  # Highest fees at top
    ax.grid(True, axis='x', alpha=0.2)

    # Remove y-axis line
    ax.spines['left'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_tip_size_distribution_chart(data):
    """
    Horizontal bar chart showing tip size distribution with micropayment highlight.
    """
    fig, ax = plt.subplots(figsize=(7, 4))

    ranges = [d['range'] for d in data]
    percentages = [d['percentage'] for d in data]
    colors = [CHART_COLORS['primary'] if d['is_micropayment'] else CHART_COLORS['text_dim']
              for d in data]

    y_pos = np.arange(len(ranges))
    bars = ax.barh(y_pos, percentages, color=colors, height=0.6, edgecolor='none')

    # Add percentage labels
    for bar, pct in zip(bars, percentages):
        width = bar.get_width()
        ax.text(width + 1, bar.get_y() + bar.get_height()/2, f'{pct}%',
                ha='left', va='center', fontsize=9, color=CHART_COLORS['text_bright'])

    # Styling
    ax.set_yticks(y_pos)
    ax.set_yticklabels(ranges, fontsize=10)
    ax.set_xlabel('% of Tips', fontsize=10)
    ax.set_title('Tip Size Distribution', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.set_xlim(0, 35)
    ax.invert_yaxis()
    ax.grid(True, axis='x', alpha=0.2)

    # Add micropayment annotation
    micropayment_total = sum(d['percentage'] for d in data if d['is_micropayment'])
    ax.text(0.98, 0.05, f'Micropayments (<$10): {micropayment_total}%',
            transform=ax.transAxes, fontsize=10, color=CHART_COLORS['primary'],
            ha='right', fontweight='bold')

    ax.spines['left'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_zcash_shielded_growth_chart(data):
    """
    Area chart showing Zcash shielded pool growth from 11% to 30%.
    """
    fig, ax = plt.subplots(figsize=(7, 3.5))

    years = [d['year'] for d in data]
    percentages = [d['percentage'] for d in data]

    # Plot line and area
    ax.plot(years, percentages, color=CHART_COLORS['primary'], linewidth=2.5,
            marker='o', markersize=8)
    ax.fill_between(years, percentages, alpha=0.2, color=CHART_COLORS['primary'])

    # Annotations
    ax.annotate('11%', xy=(years[0], percentages[0]), xytext=(years[0], percentages[0]+3),
                fontsize=9, color=CHART_COLORS['text_muted'], ha='center')
    ax.annotate('30%', xy=(years[-1], percentages[-1]), xytext=(years[-1], percentages[-1]+3),
                fontsize=10, color=CHART_COLORS['primary'], ha='center', fontweight='bold')

    # Styling
    ax.set_ylabel('% in Shielded Pool', fontsize=10)
    ax.set_title('Zcash Shielded Pool Adoption', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.set_ylim(0, 40)
    ax.grid(True, alpha=0.2)

    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_competitive_positioning_chart(data):
    """
    2x2 quadrant chart: Privacy vs Fee-Free positioning.
    """
    fig, ax = plt.subplots(figsize=(7, 6))

    for item in data:
        color = CHART_COLORS['success'] if item['name'] == 'TIPZ' else CHART_COLORS['text_dim']
        alpha = 1.0 if item['name'] == 'TIPZ' else 0.6
        size = item['size'] * 3 if item['name'] == 'TIPZ' else item['size'] * 2

        ax.scatter(item['privacy'], item['fee_score'], s=size, c=color,
                   alpha=alpha, edgecolors='white', linewidths=0.5)

        # Label positioning
        offset_y = 0.5 if item['name'] != 'TIPZ' else 0.8
        fontweight = 'bold' if item['name'] == 'TIPZ' else 'normal'
        fontsize = 10 if item['name'] == 'TIPZ' else 8

        ax.annotate(item['name'], xy=(item['privacy'], item['fee_score']),
                    xytext=(item['privacy'], item['fee_score'] + offset_y),
                    fontsize=fontsize, ha='center', fontweight=fontweight,
                    color=CHART_COLORS['text_bright'] if item['name'] == 'TIPZ'
                    else CHART_COLORS['text_muted'])

    # Quadrant lines
    ax.axhline(y=5, color=CHART_COLORS['border'], linestyle='--', alpha=0.5)
    ax.axvline(x=5, color=CHART_COLORS['border'], linestyle='--', alpha=0.5)

    # Quadrant labels
    ax.text(2.5, 9, 'Low Privacy\nLow Fees', ha='center', va='top',
            fontsize=8, color=CHART_COLORS['text_dim'], alpha=0.7)
    ax.text(7.5, 9, 'High Privacy\nLow Fees', ha='center', va='top',
            fontsize=8, color=CHART_COLORS['success'], alpha=0.9)
    ax.text(2.5, 1, 'Low Privacy\nHigh Fees', ha='center', va='bottom',
            fontsize=8, color=CHART_COLORS['error'], alpha=0.7)
    ax.text(7.5, 1, 'High Privacy\nHigh Fees', ha='center', va='bottom',
            fontsize=8, color=CHART_COLORS['text_dim'], alpha=0.7)

    # Styling
    ax.set_xlabel('Privacy Level', fontsize=10)
    ax.set_ylabel('Fee-Free Score (Higher = Lower Fees)', fontsize=10)
    ax.set_title('Competitive Positioning Matrix', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.set_xlim(-0.5, 11)
    ax.set_ylim(0, 11)
    ax.grid(True, alpha=0.15)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_volume_projections_chart(scenarios):
    """
    Line chart showing 3-scenario volume projections.
    """
    fig, ax = plt.subplots(figsize=(8, 4.5))

    colors = {
        'conservative': CHART_COLORS['text_dim'],
        'base': CHART_COLORS['primary'],
        'optimistic': CHART_COLORS['success'],
    }

    for scenario_key, scenario_data in scenarios.items():
        months = [d['month'] for d in scenario_data['data']]
        volumes = [d['volume'] for d in scenario_data['data']]

        ax.plot(months, volumes, color=colors[scenario_key], linewidth=2.5,
                marker='o', markersize=5, label=scenario_data['name'])

        # End label
        ax.annotate(f"${volumes[-1]:,}", xy=(months[-1], volumes[-1]),
                    xytext=(months[-1]+1, volumes[-1]),
                    fontsize=9, color=colors[scenario_key], fontweight='bold',
                    va='center')

    # Styling
    ax.set_xlabel('Month', fontsize=10)
    ax.set_ylabel('Monthly Volume (ZEC)', fontsize=10)
    ax.set_title('Volume Projections: 3-Year Scenarios', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.set_xlim(-1, 40)
    ax.set_yscale('log')
    ax.grid(True, alpha=0.2)
    ax.legend(loc='upper left', framealpha=0.3, fontsize=9)

    # Add Y-axis formatting for log scale
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))

    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_tam_sam_som_chart(data):
    """
    Funnel/pyramid chart for TAM/SAM/SOM visualization.
    """
    fig, ax = plt.subplots(figsize=(6, 4))

    # Draw funnel as stacked horizontal bars (pyramid effect)
    levels = [
        ('TAM', data['tam']['value'], data['tam']['unit'], CHART_COLORS['text_dim']),
        ('SAM', data['sam']['value'], data['sam']['unit'], CHART_COLORS['primary']),
        ('SOM', data['som']['value'], data['som']['unit'], CHART_COLORS['success']),
    ]

    y_positions = [2, 1, 0]
    widths = [100, 60, 30]  # Relative widths for funnel effect

    for i, (name, value, unit, color) in enumerate(levels):
        width = widths[i]
        left = (100 - width) / 2
        bar = ax.barh(y_positions[i], width, left=left, height=0.7,
                      color=color, alpha=0.8, edgecolor='white', linewidth=1)

        # Label
        label = f'{name}: ${value}{unit}'
        ax.text(50, y_positions[i], label, ha='center', va='center',
                fontsize=11, fontweight='bold', color=CHART_COLORS['text_bright'])

    # Description labels on right
    descriptions = [
        data['tam']['description'],
        data['sam']['description'],
        data['som']['description'],
    ]
    for i, desc in enumerate(descriptions):
        ax.text(105, y_positions[i], desc, ha='left', va='center',
                fontsize=8, color=CHART_COLORS['text_muted'])

    # Styling
    ax.set_xlim(-10, 180)
    ax.set_ylim(-0.5, 3)
    ax.set_title('Market Sizing', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)
    ax.axis('off')

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_fee_waterfall_chart(traditional, tipz):
    """
    Comparison waterfall showing $5 tip breakdown: Traditional vs TIPZ.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

    # Traditional platform waterfall
    steps = traditional['steps']
    labels = [s['name'] for s in steps]

    # Calculate running total for waterfall
    running = []
    current = 0
    for s in steps:
        if s['type'] == 'start':
            current = s['amount']
            running.append(current)
        else:
            current += s['amount']
            running.append(current)

    colors1 = [CHART_COLORS['success'] if s['type'] == 'start' else CHART_COLORS['error']
               for s in steps]

    x_pos = np.arange(len(labels))
    ax1.bar(x_pos, running, color=colors1, width=0.6, edgecolor='none')

    # Final creator receives
    ax1.axhline(y=traditional['creator_receives'], color=CHART_COLORS['success'],
                linestyle='--', alpha=0.5)
    ax1.text(len(labels)-0.5, traditional['creator_receives']+0.2,
             f"Creator: ${traditional['creator_receives']:.2f}",
             fontsize=9, color=CHART_COLORS['success'])

    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)
    ax1.set_ylabel('Amount ($)', fontsize=9)
    ax1.set_title(f"Traditional Platform\n{traditional['fee_percentage']}% lost to fees",
                  fontsize=10, color=CHART_COLORS['error'], fontweight='bold')
    ax1.set_ylim(0, 6)
    ax1.grid(True, axis='y', alpha=0.2)

    # TIPZ waterfall
    steps2 = tipz['steps']
    labels2 = [s['name'] for s in steps2]

    running2 = []
    current2 = 0
    for s in steps2:
        if s['type'] == 'start':
            current2 = s['amount']
            running2.append(current2)
        else:
            current2 += s['amount']
            running2.append(current2)

    colors2 = [CHART_COLORS['success'] if s['type'] == 'start' else CHART_COLORS['primary']
               for s in steps2]

    x_pos2 = np.arange(len(labels2))
    ax2.bar(x_pos2, running2, color=colors2, width=0.6, edgecolor='none')

    ax2.axhline(y=tipz['creator_receives'], color=CHART_COLORS['success'],
                linestyle='--', alpha=0.5)
    ax2.text(len(labels2)-0.5, tipz['creator_receives']+0.2,
             f"Creator: ${tipz['creator_receives']:.2f}",
             fontsize=9, color=CHART_COLORS['success'])

    ax2.set_xticks(x_pos2)
    ax2.set_xticklabels(labels2, rotation=45, ha='right', fontsize=8)
    ax2.set_title(f"TIPZ\n{tipz['fee_percentage']}% in minimal fees",
                  fontsize=10, color=CHART_COLORS['success'], fontweight='bold')
    ax2.set_ylim(0, 6)
    ax2.grid(True, axis='y', alpha=0.2)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_use_of_funds_chart(data):
    """
    Pie chart for use of funds breakdown.
    """
    fig, ax = plt.subplots(figsize=(5, 4))

    labels = [d['category'] for d in data]
    sizes = [d['percentage'] for d in data]
    colors = [CHART_COLORS['primary'], CHART_COLORS['success'],
              CHART_COLORS['chart_blue'], CHART_COLORS['text_dim']]

    wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.0f%%',
                                       colors=colors, startangle=90,
                                       textprops={'fontsize': 9, 'color': CHART_COLORS['text_bright']})

    for autotext in autotexts:
        autotext.set_color(CHART_COLORS['background'])
        autotext.set_fontweight('bold')

    ax.set_title('Use of Funds', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', pad=15)

    plt.tight_layout()
    return save_chart_to_bytes(fig)


def create_architecture_flow_chart():
    """
    Flow diagram: Any Token -> Swap -> ZEC -> Shielded -> Creator.
    """
    fig, ax = plt.subplots(figsize=(9, 2.5))

    steps = [
        ('Any Token', CHART_COLORS['chart_blue']),
        ('DEX Swap', CHART_COLORS['chart_purple']),
        ('ZEC', CHART_COLORS['primary']),
        ('Shielded Transfer', CHART_COLORS['success']),
        ('Creator Wallet', CHART_COLORS['success']),
    ]

    box_width = 1.5
    box_height = 0.8
    spacing = 0.3

    for i, (label, color) in enumerate(steps):
        x = i * (box_width + spacing)

        # Draw box
        rect = mpatches.FancyBboxPatch((x, 0.1), box_width, box_height,
                                        boxstyle="round,pad=0.05",
                                        facecolor=color, edgecolor='white',
                                        linewidth=1, alpha=0.8)
        ax.add_patch(rect)

        # Label
        ax.text(x + box_width/2, 0.5, label, ha='center', va='center',
                fontsize=9, fontweight='bold', color=CHART_COLORS['background'])

        # Arrow to next box
        if i < len(steps) - 1:
            arrow_x = x + box_width + 0.05
            ax.annotate('', xy=(arrow_x + spacing - 0.1, 0.5),
                        xytext=(arrow_x, 0.5),
                        arrowprops=dict(arrowstyle='->', color=CHART_COLORS['text_muted'],
                                        lw=2))

    ax.set_xlim(-0.2, len(steps) * (box_width + spacing))
    ax.set_ylim(-0.2, 1.2)
    ax.set_title('TIPZ Architecture Flow', fontsize=12,
                 color=CHART_COLORS['text_bright'], fontweight='bold', y=1.1)
    ax.axis('off')

    plt.tight_layout()
    return save_chart_to_bytes(fig)


# Export all chart functions
__all__ = [
    'create_creator_economy_growth_chart',
    'create_fee_comparison_chart',
    'create_tip_size_distribution_chart',
    'create_zcash_shielded_growth_chart',
    'create_competitive_positioning_chart',
    'create_volume_projections_chart',
    'create_tam_sam_som_chart',
    'create_fee_waterfall_chart',
    'create_use_of_funds_chart',
    'create_architecture_flow_chart',
]
