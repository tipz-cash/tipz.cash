"""
TIPZ Research PDF - Style Definitions
Color palette, fonts, and layout constants matching TIPZ brand guidelines.
"""

from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter

# =============================================================================
# PAGE DIMENSIONS
# =============================================================================
PAGE_WIDTH, PAGE_HEIGHT = letter  # 8.5" x 11"
MARGIN = 0.75 * inch
CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)
CONTENT_HEIGHT = PAGE_HEIGHT - (2 * MARGIN)

# =============================================================================
# COLOR PALETTE (TIPZ Brand)
# =============================================================================
COLORS = {
    # Backgrounds
    'background': HexColor('#08090a'),      # True black
    'surface': HexColor('#12141a'),         # Card backgrounds
    'surface_light': HexColor('#1a1d24'),   # Lighter surface
    'border': HexColor('#262626'),          # Borders

    # Primary colors
    'primary': HexColor('#F5A623'),         # Terminal amber (CTAs, highlights)
    'primary_dark': HexColor('#D4920F'),    # Darker amber
    'success': HexColor('#22C55E'),         # Green (positive data)
    'error': HexColor('#EF4444'),           # Red (fees, problems)
    'warning': HexColor('#F59E0B'),         # Warning orange

    # Text
    'text_bright': HexColor('#F9FAFB'),     # Headers
    'text_muted': HexColor('#D1D5DB'),      # Body text
    'text_dim': HexColor('#9CA3AF'),        # Secondary text

    # Chart colors
    'chart_blue': HexColor('#3B82F6'),
    'chart_purple': HexColor('#8B5CF6'),
    'chart_cyan': HexColor('#06B6D4'),
    'chart_pink': HexColor('#EC4899'),
}

# Matplotlib color strings (for charts)
CHART_COLORS = {
    'background': '#08090a',
    'surface': '#12141a',
    'primary': '#F5A623',
    'success': '#22C55E',
    'error': '#EF4444',
    'text_bright': '#F9FAFB',
    'text_muted': '#D1D5DB',
    'text_dim': '#9CA3AF',
    'border': '#262626',
    'chart_blue': '#3B82F6',
    'chart_purple': '#8B5CF6',
    'chart_cyan': '#06B6D4',
    'chart_pink': '#EC4899',
}

# =============================================================================
# TYPOGRAPHY
# =============================================================================
# Font families (using standard PDF fonts for compatibility)
# Note: JetBrains Mono would require font registration with reportlab
FONT_MONO = 'Courier'        # Standard monospace PDF font
FONT_SANS = 'Helvetica'      # Standard PDF font

# Font sizes
FONT_SIZES = {
    'title': 36,
    'h1': 28,
    'h2': 20,
    'h3': 16,
    'body': 11,
    'body_large': 13,
    'small': 9,
    'tiny': 8,
    'stat_large': 48,
    'stat_medium': 32,
    'stat_small': 24,
}

# Line heights (as multipliers)
LINE_HEIGHTS = {
    'tight': 1.2,
    'normal': 1.4,
    'relaxed': 1.6,
}

# =============================================================================
# SPACING
# =============================================================================
SPACING = {
    'xs': 4,
    'sm': 8,
    'md': 16,
    'lg': 24,
    'xl': 32,
    'xxl': 48,
}

# =============================================================================
# COMPONENT STYLES
# =============================================================================
CARD_STYLE = {
    'background': COLORS['surface'],
    'border_color': COLORS['border'],
    'border_width': 1,
    'padding': SPACING['md'],
    'radius': 0,  # Sharp corners for terminal aesthetic
}

STAT_BOX_STYLE = {
    'background': COLORS['surface'],
    'border_color': COLORS['primary'],
    'border_width': 2,
    'padding': SPACING['lg'],
}

TABLE_STYLE = {
    'header_bg': COLORS['surface_light'],
    'row_bg': COLORS['surface'],
    'alt_row_bg': COLORS['background'],
    'border_color': COLORS['border'],
    'header_text': COLORS['text_bright'],
    'cell_text': COLORS['text_muted'],
}

# =============================================================================
# SECTION HEADERS
# =============================================================================
SECTION_HEADER_STYLE = {
    'font': FONT_MONO,
    'size': FONT_SIZES['h1'],
    'color': COLORS['text_bright'],
    'accent_color': COLORS['primary'],
    'margin_bottom': SPACING['lg'],
}
