#!/usr/bin/env python3
"""
TIPZ Research PDF Generator
Generates a professional VC-ready research document for TIPZ.

Usage:
    python generate_pdf.py
    python generate_pdf.py --output custom_name.pdf
"""

import os
import sys
import argparse
from io import BytesIO

from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, Image
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Local imports
from styles import (
    COLORS, FONT_SIZES, FONT_MONO, FONT_SANS, SPACING,
    MARGIN, CONTENT_WIDTH, PAGE_WIDTH, PAGE_HEIGHT
)
from data import (
    DOCUMENT, EXECUTIVE_SUMMARY, HERO_STATS, PROBLEM,
    FEE_WATERFALL, TIPZ_WATERFALL, MARKET, CREATOR_ECONOMY_GROWTH,
    TIP_SIZE_DISTRIBUTION, ZCASH_SHIELDED_GROWTH, COMPETITORS,
    FEATURE_COMPARISON, COMPETITIVE_POSITIONING, SOLUTION,
    BUSINESS_MODEL, PROJECTIONS, GTM, TEAM, TRACTION,
    INVESTMENT, SOURCES
)
from components import (
    STYLES, create_section_header, create_stat_box, create_stat_row,
    create_data_table, create_card, create_bullet_list, create_feature_matrix,
    create_placeholder, create_image_with_caption, on_page
)
from charts import (
    create_creator_economy_growth_chart,
    create_fee_comparison_chart,
    create_tip_size_distribution_chart,
    create_zcash_shielded_growth_chart,
    create_competitive_positioning_chart,
    create_volume_projections_chart,
    create_tam_sam_som_chart,
    create_fee_waterfall_chart,
    create_use_of_funds_chart,
    create_architecture_flow_chart,
)


def create_cover_page(elements):
    """Create the cover page."""
    # Add vertical spacing to center content
    elements.append(Spacer(1, 2.5 * inch))

    # TIPZ Logo/Title
    title_style = ParagraphStyle(
        'cover_title',
        fontName=FONT_MONO,
        fontSize=72,
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph('TIPZ', title_style))
    elements.append(Spacer(1, SPACING['md']))

    # Tagline
    tagline_style = ParagraphStyle(
        'cover_tagline',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['h3'],
        textColor=COLORS['text_muted'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(DOCUMENT['tagline'], tagline_style))
    elements.append(Spacer(1, inch))

    # Subtitle
    subtitle_style = ParagraphStyle(
        'cover_subtitle',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['h2'],
        textColor=COLORS['text_bright'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(DOCUMENT['subtitle'], subtitle_style))
    elements.append(Spacer(1, 2 * inch))

    # Date/Version
    date_style = ParagraphStyle(
        'cover_date',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['text_dim'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(f"{DOCUMENT['date']} | Version {DOCUMENT['version']}", date_style))

    elements.append(PageBreak())


def create_executive_summary(elements):
    """Create the executive summary page."""
    elements.extend(create_section_header('Executive Summary', '01'))
    elements.append(Spacer(1, SPACING['md']))

    # Problem card
    elements.append(create_card(
        'The Problem',
        EXECUTIVE_SUMMARY['problem'],
        accent_color='error'
    ))
    elements.append(Spacer(1, SPACING['md']))

    # Solution card
    elements.append(create_card(
        'The Solution',
        EXECUTIVE_SUMMARY['solution'],
        accent_color='success'
    ))
    elements.append(Spacer(1, SPACING['md']))

    # Opportunity card
    elements.append(create_card(
        'The Opportunity',
        EXECUTIVE_SUMMARY['opportunity'],
        accent_color='primary'
    ))
    elements.append(Spacer(1, SPACING['lg']))

    # Hero stats row
    elements.append(create_stat_row(HERO_STATS))

    elements.append(PageBreak())


def create_problem_section(elements):
    """Create the problem section (2 pages)."""
    elements.extend(create_section_header('The Problem', '02'))
    elements.append(Spacer(1, SPACING['md']))

    # Fee Extraction subsection
    elements.append(Paragraph(PROBLEM['fee_extraction']['title'], STYLES['h2']))
    elements.append(Paragraph(PROBLEM['fee_extraction']['description'], STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Fee waterfall chart
    waterfall_chart = create_fee_waterfall_chart(FEE_WATERFALL, TIPZ_WATERFALL)
    elements.append(create_image_with_caption(
        waterfall_chart,
        caption='$5 Tip Breakdown: Traditional Platform vs TIPZ',
        width=CONTENT_WIDTH
    ))
    elements.append(Spacer(1, SPACING['lg']))

    # Platform Fee Comparison
    elements.append(Paragraph(PROBLEM['concentration']['title'], STYLES['h2']))
    elements.append(Paragraph(PROBLEM['concentration']['description'], STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Fee comparison chart
    fee_chart = create_fee_comparison_chart(COMPETITORS)
    elements.append(create_image_with_caption(
        fee_chart,
        caption='Platform Fee Comparison',
        width=CONTENT_WIDTH
    ))

    elements.append(PageBreak())

    # Surveillance subsection
    elements.append(Paragraph(PROBLEM['surveillance']['title'], STYLES['h2']))
    elements.append(Paragraph(PROBLEM['surveillance']['description'], STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Surveillance stats
    elements.append(create_stat_row(PROBLEM['surveillance']['stats']))
    elements.append(Spacer(1, SPACING['lg']))

    # Key insight callout
    insight_style = ParagraphStyle(
        'insight',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body_large'],
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
        spaceBefore=SPACING['lg'],
        spaceAfter=SPACING['lg'],
    )
    elements.append(Paragraph(
        '"Every on-chain transaction is permanent.<br/>Financial surveillance is the default."',
        insight_style
    ))

    elements.append(PageBreak())


def create_market_section(elements):
    """Create the market opportunity section (3 pages)."""
    elements.extend(create_section_header('Market Opportunity', '03'))
    elements.append(Spacer(1, SPACING['md']))

    # Creator Economy
    elements.append(Paragraph('Creator Economy', STYLES['h2']))
    market_ce = MARKET['creator_economy']
    ce_text = (
        f"The creator economy has grown to <b>${market_ce['current_size']}B</b> in 2024 "
        f"and is projected to reach <b>${market_ce['projected_size']}B by 2027</b> at a "
        f"<b>{market_ce['cagr']}% CAGR</b>. With {market_ce['creators']}M+ content creators worldwide "
        f"and {market_ce['full_time_pct']}% now working full-time, the infrastructure for creator "
        f"monetization is more critical than ever."
    )
    elements.append(Paragraph(ce_text, STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Growth chart
    growth_chart = create_creator_economy_growth_chart(CREATOR_ECONOMY_GROWTH)
    elements.append(create_image_with_caption(
        growth_chart,
        caption=f'Source: {market_ce["source"]}',
        width=CONTENT_WIDTH
    ))

    elements.append(PageBreak())

    # Tipping Market
    elements.append(Paragraph('Tipping Market', STYLES['h2']))
    market_tip = MARKET['tipping_market']
    tip_text = (
        f"The creator tipping market is valued at <b>${market_tip['size']}B</b> with "
        f"<b>{market_tip['annual_tips']}M+ tips annually</b>. Critically, "
        f"<b>{market_tip['micropayment_pct']}% are micropayments under $10</b>\u2014exactly where "
        f"traditional fee structures cause the most damage. Over <b>${market_tip['fees_extracted']}B</b> "
        f"is extracted from creators annually in platform and payment fees."
    )
    elements.append(Paragraph(tip_text, STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Tip distribution chart
    dist_chart = create_tip_size_distribution_chart(TIP_SIZE_DISTRIBUTION)
    elements.append(create_image_with_caption(
        dist_chart,
        caption='Tip Size Distribution (40% are micropayments)',
        width=CONTENT_WIDTH * 0.85
    ))
    elements.append(Spacer(1, SPACING['lg']))

    elements.append(PageBreak())

    # Privacy & Zcash
    elements.append(Paragraph('Privacy Crypto Momentum', STYLES['h2']))
    market_zec = MARKET['privacy_crypto']
    zec_text = (
        f"Privacy-preserving cryptocurrency is experiencing unprecedented growth. "
        f"Zcash surged <b>{market_zec['zcash_surge']}%</b> to a <b>${market_zec['zcash_mcap']}B market cap</b>. "
        f"The shielded pool now holds <b>{market_zec['shielded_pct']}% of ZEC</b> (up from 11%), "
        f"demonstrating strong demand for transaction privacy. "
        f"<b>{market_zec['privacy_tx_pct']}%</b> of all crypto transactions now use privacy coins."
    )
    elements.append(Paragraph(zec_text, STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Zcash stats row
    zec_stats = [
        {'value': f"{market_zec['zcash_surge']}%", 'label': 'ZEC Price Surge', 'color': 'success'},
        {'value': f"${market_zec['grayscale_aum']}M", 'label': 'Grayscale ZEC AUM', 'color': 'primary'},
        {'value': f"{market_zec['merchants']}", 'label': 'Merchants Accept ZEC', 'color': 'primary'},
    ]
    elements.append(create_stat_row(zec_stats))
    elements.append(Spacer(1, SPACING['md']))

    # Shielded growth chart
    shield_chart = create_zcash_shielded_growth_chart(ZCASH_SHIELDED_GROWTH)
    elements.append(create_image_with_caption(
        shield_chart,
        caption=f'Source: {market_zec["source"]}',
        width=CONTENT_WIDTH * 0.85
    ))

    elements.append(PageBreak())


def create_competitive_section(elements):
    """Create the competitive landscape section (2 pages)."""
    elements.extend(create_section_header('Competitive Landscape', '04'))
    elements.append(Spacer(1, SPACING['md']))

    # Intro text
    intro = (
        "The creator tipping space is fragmented between traditional platforms with high fees "
        "and crypto solutions with no privacy. TIPZ occupies a unique position as the only "
        "solution that combines zero platform fees, full transaction privacy, self-custody, "
        "and any-token support."
    )
    elements.append(Paragraph(intro, STYLES['body']))
    elements.append(Spacer(1, SPACING['md']))

    # Fee comparison table
    headers = ['Platform', 'Platform Fee', 'Payment Fee', 'Total Take', 'Privacy']
    rows = []
    highlight_idx = None
    for i, comp in enumerate(COMPETITORS):
        rows.append([
            comp['name'],
            comp['platform_fee'],
            comp['payment_fee'],
            comp['total_take'],
            comp['privacy'],
        ])
        if comp.get('highlight'):
            highlight_idx = i

    col_widths = [CONTENT_WIDTH * 0.28, CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.18,
                  CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.18]
    elements.append(create_data_table(headers, rows, col_widths=col_widths, highlight_row=highlight_idx))

    elements.append(PageBreak())

    # Feature matrix
    elements.append(Paragraph('Feature Comparison', STYLES['h2']))
    elements.append(Spacer(1, SPACING['sm']))

    elements.append(create_feature_matrix(
        FEATURE_COMPARISON['features'],
        FEATURE_COMPARISON['competitors']
    ))
    elements.append(Spacer(1, SPACING['lg']))

    # Positioning chart
    elements.append(Paragraph('Competitive Positioning', STYLES['h2']))
    pos_chart = create_competitive_positioning_chart(COMPETITIVE_POSITIONING)
    elements.append(create_image_with_caption(
        pos_chart,
        caption='TIPZ: The only high-privacy, fee-free solution',
        width=CONTENT_WIDTH * 0.85
    ))

    elements.append(PageBreak())


def create_solution_section(elements):
    """Create the TIPZ solution section (2 pages)."""
    elements.extend(create_section_header('The TIPZ Solution', '05'))
    elements.append(Spacer(1, SPACING['md']))

    # Overview
    elements.append(Paragraph(SOLUTION['overview'], STYLES['body_large']))
    elements.append(Spacer(1, SPACING['md']))

    # Architecture flow chart
    arch_chart = create_architecture_flow_chart()
    elements.append(create_image_with_caption(
        arch_chart,
        caption='TIPZ Transaction Flow',
        width=CONTENT_WIDTH
    ))
    elements.append(Spacer(1, SPACING['lg']))

    # Product Components
    elements.append(Paragraph('Product Components', STYLES['h2']))
    elements.append(Spacer(1, SPACING['sm']))

    for comp in SOLUTION['components']:
        status_color = 'success' if 'Complete' in comp['status'] else 'primary'
        status_text = f'<font color="{COLORS[status_color].hexval()}">[{comp["status"]}]</font>'
        elements.append(create_card(
            f"{comp['name']} {status_text}",
            comp['description'],
            accent_color=status_color,
            width=CONTENT_WIDTH
        ))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(PageBreak())

    # Value Propositions
    elements.append(Paragraph('Value Proposition', STYLES['h2']))
    elements.append(Spacer(1, SPACING['sm']))

    # Two-column layout for creators and tippers
    creator_items = [f"<b>{vp['title']}</b>: {vp['description']}"
                     for vp in SOLUTION['value_props']['creators']]
    tipper_items = [f"<b>{vp['title']}</b>: {vp['description']}"
                    for vp in SOLUTION['value_props']['tippers']]

    elements.append(Paragraph('For Creators:', STYLES['h3']))
    elements.append(create_bullet_list(creator_items, color='success'))
    elements.append(Spacer(1, SPACING['md']))

    elements.append(Paragraph('For Tippers:', STYLES['h3']))
    elements.append(create_bullet_list(tipper_items, color='primary'))

    elements.append(PageBreak())


def create_business_section(elements):
    """Create the business model & projections section (2 pages)."""
    elements.extend(create_section_header('Business Model & Projections', '06'))
    elements.append(Spacer(1, SPACING['md']))

    # Business model overview
    elements.append(Paragraph('Revenue Model', STYLES['h2']))
    for stream in BUSINESS_MODEL['revenue_streams']:
        status = stream['status']
        status_color = 'success' if status == 'Active' else 'text_dim'
        status_text = f'<font color="{COLORS[status_color].hexval()}">[{status}]</font>'
        elements.append(Paragraph(
            f"<b>{stream['name']}</b> {status_text}: {stream['description']}",
            STYLES['body']
        ))
        elements.append(Spacer(1, SPACING['xs']))

    elements.append(Spacer(1, SPACING['md']))

    # Volume projections chart
    elements.append(Paragraph('Volume Projections', STYLES['h2']))
    proj_chart = create_volume_projections_chart(PROJECTIONS['scenarios'])
    elements.append(create_image_with_caption(
        proj_chart,
        caption='Monthly ZEC Volume: 3-Year Scenarios',
        width=CONTENT_WIDTH
    ))
    elements.append(Spacer(1, SPACING['md']))

    # Assumptions
    elements.append(Paragraph('Key Assumptions:', STYLES['h3']))
    elements.append(create_bullet_list(PROJECTIONS['assumptions'], bullet='-', color='text_dim'))

    elements.append(PageBreak())

    # Use of funds
    elements.append(Paragraph('Use of Funds', STYLES['h2']))
    funds_chart = create_use_of_funds_chart(BUSINESS_MODEL['funding']['use_of_funds'])
    elements.append(create_image_with_caption(
        funds_chart,
        width=CONTENT_WIDTH * 0.6
    ))

    elements.append(PageBreak())


def create_gtm_section(elements):
    """Create the go-to-market strategy section (1 page)."""
    elements.extend(create_section_header('Go-to-Market Strategy', '07'))
    elements.append(Spacer(1, SPACING['md']))

    # Target segments
    elements.append(Paragraph('Target Segments', STYLES['h2']))
    for seg in GTM['target_segments']:
        priority_color = 'success' if seg['priority'] == 'Primary' else 'primary' if seg['priority'] == 'Launch' else 'text_dim'
        priority_text = f'<font color="{COLORS[priority_color].hexval()}">[{seg["priority"]}]</font>'
        elements.append(Paragraph(
            f"<b>{seg['segment']}</b> {priority_text}",
            STYLES['h3']
        ))
        elements.append(Paragraph(f"{seg['description']} ({seg['size']})", STYLES['body']))
        elements.append(Spacer(1, SPACING['xs']))

    elements.append(Spacer(1, SPACING['md']))

    # TAM/SAM/SOM
    elements.append(Paragraph('Market Sizing', STYLES['h2']))
    tam_chart = create_tam_sam_som_chart(GTM['tam_sam_som'])
    elements.append(create_image_with_caption(
        tam_chart,
        width=CONTENT_WIDTH * 0.75
    ))
    elements.append(Spacer(1, SPACING['md']))

    # Phases
    elements.append(Paragraph('Launch Phases', STYLES['h2']))
    for phase in GTM['phases']:
        elements.append(Paragraph(
            f"<b>{phase['phase']}</b> ({phase['timeline']})",
            STYLES['h3']
        ))
        elements.append(create_bullet_list(phase['goals'], bullet='>', color='primary'))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(PageBreak())


def create_team_section(elements):
    """Create the team & advisors section (placeholder)."""
    elements.extend(create_section_header('Team & Advisors', '08'))
    elements.append(Spacer(1, SPACING['md']))

    # Placeholder notice
    notice_style = ParagraphStyle(
        'notice',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(TEAM['note'], notice_style))
    elements.append(Spacer(1, SPACING['lg']))

    # Team member placeholders
    elements.append(Paragraph('Founding Team', STYLES['h2']))
    for member in TEAM['members']:
        elements.append(create_placeholder(
            f"{member['name']}<br/><br/>{member['role']}<br/><br/>{member['bio']}",
            height=1.2 * inch
        ))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(Spacer(1, SPACING['md']))

    # Advisors placeholder
    elements.append(Paragraph('Advisors', STYLES['h2']))
    for advisor in TEAM['advisors']:
        elements.append(create_placeholder(
            f"{advisor['name']} | {advisor['affiliation']}<br/>{advisor['expertise']}",
            height=0.8 * inch
        ))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(PageBreak())


def create_traction_section(elements):
    """Create the traction & metrics section (placeholder)."""
    elements.extend(create_section_header('Traction & Metrics', '09'))
    elements.append(Spacer(1, SPACING['md']))

    # Placeholder notice
    notice_style = ParagraphStyle(
        'notice',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(TRACTION['note'], notice_style))
    elements.append(Spacer(1, SPACING['lg']))

    # Metrics placeholders
    elements.append(Paragraph('Key Metrics', STYLES['h2']))
    metrics_data = []
    for metric in TRACTION['metrics']:
        metrics_data.append({
            'value': metric['value'],
            'label': f"{metric['name']} {metric['growth']}",
            'color': 'primary'
        })

    # Display as stat boxes (2 per row)
    for i in range(0, len(metrics_data), 2):
        row_data = metrics_data[i:i+2]
        elements.append(create_stat_row(row_data))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(Spacer(1, SPACING['md']))

    # Partnerships placeholder
    elements.append(Paragraph('Partnership Pipeline', STYLES['h2']))
    for partner in TRACTION['partnerships']:
        elements.append(create_placeholder(
            f"{partner['name']} | {partner['status']}<br/>{partner['description']}",
            height=0.6 * inch
        ))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(Spacer(1, SPACING['md']))

    # Grants placeholder
    elements.append(Paragraph('Grant Applications', STYLES['h2']))
    for grant in TRACTION['grants']:
        elements.append(create_placeholder(
            f"{grant['name']} | {grant['amount']} | {grant['status']}",
            height=0.5 * inch
        ))
        elements.append(Spacer(1, SPACING['sm']))

    elements.append(PageBreak())


def create_investment_section(elements):
    """Create the investment opportunity section."""
    elements.extend(create_section_header('Investment Opportunity', '10'))
    elements.append(Spacer(1, SPACING['md']))

    # Headline
    headline_style = ParagraphStyle(
        'investment_headline',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['h2'],
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
        spaceBefore=SPACING['lg'],
        spaceAfter=SPACING['lg'],
    )
    elements.append(Paragraph(INVESTMENT['headline'], headline_style))
    elements.append(Spacer(1, SPACING['md']))

    # Ask placeholder
    elements.append(create_placeholder(
        f"Investment/Grant Ask: {INVESTMENT['ask']}",
        height=0.7 * inch
    ))
    elements.append(Spacer(1, SPACING['lg']))

    # 12-month milestones
    elements.append(Paragraph('12-Month Milestones', STYLES['h2']))
    elements.append(create_bullet_list(INVESTMENT['milestones_12_months'], bullet='>', color='success'))
    elements.append(Spacer(1, SPACING['md']))

    # 18-month milestones
    elements.append(Paragraph('18-Month Milestones', STYLES['h2']))
    elements.append(create_bullet_list(INVESTMENT['milestones_18_months'], bullet='>', color='primary'))
    elements.append(Spacer(1, SPACING['xl']))

    # Contact info
    contact_style = ParagraphStyle(
        'contact',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body_large'],
        textColor=COLORS['text_bright'],
        alignment=TA_CENTER,
    )
    contact = INVESTMENT['contact']
    elements.append(Paragraph(
        f"Website: {contact['website']}<br/>"
        f"Email: {contact['email']}<br/>"
        f"Twitter: {contact['twitter']}",
        contact_style
    ))

    elements.append(PageBreak())


def create_sources_section(elements):
    """Create the sources/citations appendix."""
    elements.extend(create_section_header('Appendix: Sources', '11'))
    elements.append(Spacer(1, SPACING['md']))

    for category in SOURCES:
        elements.append(Paragraph(category['category'], STYLES['h3']))
        for citation in category['citations']:
            citation_style = ParagraphStyle(
                'citation',
                fontName=FONT_SANS,
                fontSize=FONT_SIZES['small'],
                textColor=COLORS['text_dim'],
                leftIndent=SPACING['md'],
                spaceBefore=SPACING['xs'],
            )
            elements.append(Paragraph(f"\u2022 {citation}", citation_style))
        elements.append(Spacer(1, SPACING['md']))


def generate_pdf(output_path='tipz_market_research.pdf'):
    """
    Generate the complete TIPZ research PDF.

    Args:
        output_path: Output file path
    """
    print(f"Generating TIPZ Research PDF: {output_path}")

    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    # Build content
    elements = []

    print("  Creating cover page...")
    create_cover_page(elements)

    print("  Creating executive summary...")
    create_executive_summary(elements)

    print("  Creating problem section...")
    create_problem_section(elements)

    print("  Creating market opportunity section...")
    create_market_section(elements)

    print("  Creating competitive landscape...")
    create_competitive_section(elements)

    print("  Creating solution section...")
    create_solution_section(elements)

    print("  Creating business model section...")
    create_business_section(elements)

    print("  Creating go-to-market section...")
    create_gtm_section(elements)

    print("  Creating team section (placeholder)...")
    create_team_section(elements)

    print("  Creating traction section (placeholder)...")
    create_traction_section(elements)

    print("  Creating investment section...")
    create_investment_section(elements)

    print("  Creating sources appendix...")
    create_sources_section(elements)

    # Build PDF
    print("  Building PDF document...")
    doc.build(elements, onFirstPage=on_page, onLaterPages=on_page)

    print(f"\nPDF generated successfully: {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")


def main():
    parser = argparse.ArgumentParser(description='Generate TIPZ Research PDF')
    parser.add_argument(
        '--output', '-o',
        default='tipz_market_research.pdf',
        help='Output PDF filename (default: tipz_market_research.pdf)'
    )
    args = parser.parse_args()

    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Generate PDF
    output_path = os.path.join(script_dir, args.output)
    generate_pdf(output_path)


if __name__ == '__main__':
    main()
