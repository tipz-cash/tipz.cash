"""
TIPZ Research PDF - Reusable Components
Building blocks for the PDF document: stat boxes, tables, cards, headers, etc.
"""

from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    Paragraph, Table, TableStyle, Spacer, Image, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from styles import (
    COLORS, FONT_SIZES, FONT_MONO, FONT_SANS, SPACING,
    MARGIN, CONTENT_WIDTH, PAGE_WIDTH, PAGE_HEIGHT,
    CARD_STYLE, STAT_BOX_STYLE, TABLE_STYLE
)


# =============================================================================
# PARAGRAPH STYLES
# =============================================================================
def get_styles():
    """Return dictionary of paragraph styles."""
    return {
        'title': ParagraphStyle(
            'title',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['title'],
            textColor=COLORS['text_bright'],
            alignment=TA_CENTER,
            spaceAfter=SPACING['sm'],
        ),
        'subtitle': ParagraphStyle(
            'subtitle',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['h2'],
            textColor=COLORS['text_muted'],
            alignment=TA_CENTER,
            spaceAfter=SPACING['md'],
        ),
        'tagline': ParagraphStyle(
            'tagline',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['body_large'],
            textColor=COLORS['primary'],
            alignment=TA_CENTER,
            spaceAfter=SPACING['xl'],
        ),
        'h1': ParagraphStyle(
            'h1',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['h1'],
            textColor=COLORS['text_bright'],
            spaceBefore=SPACING['lg'],
            spaceAfter=SPACING['md'],
        ),
        'h2': ParagraphStyle(
            'h2',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['h2'],
            textColor=COLORS['text_bright'],
            spaceBefore=SPACING['md'],
            spaceAfter=SPACING['sm'],
        ),
        'h3': ParagraphStyle(
            'h3',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['h3'],
            textColor=COLORS['primary'],
            spaceBefore=SPACING['sm'],
            spaceAfter=SPACING['xs'],
        ),
        'body': ParagraphStyle(
            'body',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['body'],
            textColor=COLORS['text_muted'],
            leading=FONT_SIZES['body'] * 1.5,
            spaceAfter=SPACING['sm'],
        ),
        'body_large': ParagraphStyle(
            'body_large',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['body_large'],
            textColor=COLORS['text_muted'],
            leading=FONT_SIZES['body_large'] * 1.5,
            spaceAfter=SPACING['md'],
        ),
        'small': ParagraphStyle(
            'small',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['small'],
            textColor=COLORS['text_dim'],
            leading=FONT_SIZES['small'] * 1.4,
        ),
        'stat_value': ParagraphStyle(
            'stat_value',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['stat_large'],
            textColor=COLORS['primary'],
            alignment=TA_CENTER,
        ),
        'stat_label': ParagraphStyle(
            'stat_label',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['small'],
            textColor=COLORS['text_muted'],
            alignment=TA_CENTER,
        ),
        'center': ParagraphStyle(
            'center',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['body'],
            textColor=COLORS['text_muted'],
            alignment=TA_CENTER,
        ),
        'placeholder': ParagraphStyle(
            'placeholder',
            fontName=FONT_MONO,
            fontSize=FONT_SIZES['body'],
            textColor=COLORS['primary'],
            borderColor=COLORS['primary'],
            borderWidth=1,
            borderPadding=SPACING['sm'],
        ),
    }


STYLES = get_styles()


# =============================================================================
# SECTION HEADER COMPONENT
# =============================================================================
def create_section_header(title, number=None):
    """
    Create a terminal-style section header.

    Args:
        title: Section title text
        number: Optional section number

    Returns:
        List of flowable elements
    """
    elements = []

    # Section number and title
    if number:
        header_text = f'<font color="{COLORS["primary"].hexval()}">{number}.</font> {title}'
    else:
        header_text = title

    header_style = ParagraphStyle(
        'section_header',
        parent=STYLES['h1'],
        borderColor=COLORS['primary'],
        borderWidth=0,
        borderPadding=0,
    )

    elements.append(Paragraph(header_text, header_style))

    # Underline accent
    line_table = Table([['']], colWidths=[CONTENT_WIDTH])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 2, COLORS['primary']),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['sm']),
    ]))
    elements.append(line_table)

    return elements


# =============================================================================
# STAT BOX COMPONENT
# =============================================================================
def create_stat_box(value, label, color='primary', width=None):
    """
    Create a single statistic box with large value and label.

    Args:
        value: The statistic value (string)
        label: Description label
        color: Color key from COLORS dict
        width: Optional fixed width

    Returns:
        Table element styled as stat box
    """
    color_obj = COLORS.get(color, COLORS['primary'])

    value_style = ParagraphStyle(
        'stat_value_custom',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['stat_medium'],
        textColor=color_obj,
        alignment=TA_CENTER,
    )

    label_style = ParagraphStyle(
        'stat_label_custom',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['small'],
        textColor=COLORS['text_muted'],
        alignment=TA_CENTER,
    )

    data = [
        [Paragraph(value, value_style)],
        [Paragraph(label, label_style)],
    ]

    box_width = width or (CONTENT_WIDTH / 4 - SPACING['sm'])

    table = Table(data, colWidths=[box_width])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['surface']),
        ('BOX', (0, 0), (-1, -1), 2, color_obj),
        ('TOPPADDING', (0, 0), (-1, -1), SPACING['md']),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['md']),
        ('LEFTPADDING', (0, 0), (-1, -1), SPACING['sm']),
        ('RIGHTPADDING', (0, 0), (-1, -1), SPACING['sm']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    return table


def create_stat_row(stats, total_width=None):
    """
    Create a row of stat boxes.

    Args:
        stats: List of dicts with 'value', 'label', 'color' keys
        total_width: Total width for the row

    Returns:
        Table element with stat boxes
    """
    total_width = total_width or CONTENT_WIDTH
    num_stats = len(stats)
    box_width = (total_width - (SPACING['sm'] * (num_stats - 1))) / num_stats

    boxes = []
    for stat in stats:
        box = create_stat_box(
            stat['value'],
            stat['label'],
            stat.get('color', 'primary'),
            width=box_width
        )
        boxes.append(box)

    # Create outer table to hold boxes side by side
    row_table = Table([boxes], colWidths=[box_width] * num_stats)
    row_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), SPACING['sm']),
    ]))

    return row_table


# =============================================================================
# DATA TABLE COMPONENT
# =============================================================================
def create_data_table(headers, rows, col_widths=None, highlight_row=None):
    """
    Create a styled data table.

    Args:
        headers: List of header strings
        rows: List of row data (each row is a list)
        col_widths: Optional list of column widths
        highlight_row: Optional index of row to highlight

    Returns:
        Styled Table element
    """
    # Prepare data with styled headers
    header_style = ParagraphStyle(
        'table_header',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['small'],
        textColor=COLORS['text_bright'],
    )

    cell_style = ParagraphStyle(
        'table_cell',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['small'],
        textColor=COLORS['text_muted'],
    )

    highlight_style = ParagraphStyle(
        'table_highlight',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['small'],
        textColor=COLORS['success'],
    )

    # Format headers
    formatted_headers = [Paragraph(str(h), header_style) for h in headers]

    # Format rows
    formatted_rows = []
    for i, row in enumerate(rows):
        style = highlight_style if i == highlight_row else cell_style
        formatted_row = [Paragraph(str(cell), style) for cell in row]
        formatted_rows.append(formatted_row)

    data = [formatted_headers] + formatted_rows

    # Calculate column widths if not provided
    if col_widths is None:
        col_widths = [CONTENT_WIDTH / len(headers)] * len(headers)

    table = Table(data, colWidths=col_widths)

    # Build style
    style_commands = [
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['surface_light']),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLORS['text_bright']),

        # All cells
        ('TOPPADDING', (0, 0), (-1, -1), SPACING['sm']),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['sm']),
        ('LEFTPADDING', (0, 0), (-1, -1), SPACING['sm']),
        ('RIGHTPADDING', (0, 0), (-1, -1), SPACING['sm']),

        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),

        # Alternating row backgrounds
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]

    # Add alternating row backgrounds
    for i in range(1, len(data)):
        bg_color = COLORS['surface'] if i % 2 == 0 else COLORS['background']
        style_commands.append(('BACKGROUND', (0, i), (-1, i), bg_color))

    # Highlight row
    if highlight_row is not None:
        row_idx = highlight_row + 1  # Account for header
        style_commands.append(('BACKGROUND', (0, row_idx), (-1, row_idx), HexColor('#1a2e1a')))
        style_commands.append(('BOX', (0, row_idx), (-1, row_idx), 2, COLORS['success']))

    table.setStyle(TableStyle(style_commands))

    return table


# =============================================================================
# CARD / CALLOUT COMPONENT
# =============================================================================
def create_card(title, content, accent_color='primary', width=None):
    """
    Create a card/callout box with title and content.

    Args:
        title: Card title
        content: Card content (string or Paragraph)
        accent_color: Left border accent color
        width: Optional width

    Returns:
        Table element styled as card
    """
    width = width or CONTENT_WIDTH

    title_style = ParagraphStyle(
        'card_title',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['h3'],
        textColor=COLORS['text_bright'],
        spaceAfter=SPACING['xs'],
    )

    content_style = ParagraphStyle(
        'card_content',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['text_muted'],
        leading=FONT_SIZES['body'] * 1.4,
    )

    if isinstance(content, str):
        content = Paragraph(content, content_style)

    data = [
        [Paragraph(title, title_style)],
        [content],
    ]

    table = Table(data, colWidths=[width - SPACING['md']])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['surface']),
        ('LINEBEFORE', (0, 0), (0, -1), 3, COLORS.get(accent_color, COLORS['primary'])),
        ('TOPPADDING', (0, 0), (-1, -1), SPACING['md']),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['md']),
        ('LEFTPADDING', (0, 0), (-1, -1), SPACING['md']),
        ('RIGHTPADDING', (0, 0), (-1, -1), SPACING['md']),
    ]))

    return table


# =============================================================================
# BULLET LIST COMPONENT
# =============================================================================
def create_bullet_list(items, bullet='>', color='primary'):
    """
    Create a bulleted list with terminal-style bullets.

    Args:
        items: List of strings
        bullet: Bullet character
        color: Bullet color

    Returns:
        Table element
    """
    bullet_style = ParagraphStyle(
        'bullet',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS.get(color, COLORS['primary']),
    )

    item_style = ParagraphStyle(
        'list_item',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['text_muted'],
        leading=FONT_SIZES['body'] * 1.4,
    )

    data = []
    for item in items:
        data.append([
            Paragraph(bullet, bullet_style),
            Paragraph(item, item_style),
        ])

    table = Table(data, colWidths=[SPACING['lg'], CONTENT_WIDTH - SPACING['xl']])
    table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), SPACING['xs']),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['xs']),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    return table


# =============================================================================
# FEATURE COMPARISON MATRIX
# =============================================================================
def create_feature_matrix(features, competitors):
    """
    Create a feature comparison matrix with checkmarks.

    Args:
        features: List of feature names
        competitors: Dict mapping competitor name to list of booleans

    Returns:
        Styled Table element
    """
    # Build headers
    headers = ['Feature'] + list(competitors.keys())

    # Build rows
    rows = []
    for i, feature in enumerate(features):
        row = [feature]
        for comp_name, comp_features in competitors.items():
            has_feature = comp_features[i]
            if has_feature:
                cell = '<font color="#22C55E">YES</font>'
            else:
                cell = '<font color="#6B7280">-</font>'
            row.append(cell)
        rows.append(row)

    # Calculate column widths
    num_cols = len(headers)
    feature_col_width = CONTENT_WIDTH * 0.3
    other_col_width = (CONTENT_WIDTH - feature_col_width) / (num_cols - 1)
    col_widths = [feature_col_width] + [other_col_width] * (num_cols - 1)

    # Create styled data
    header_style = ParagraphStyle(
        'matrix_header',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['tiny'],
        textColor=COLORS['text_bright'],
        alignment=TA_CENTER,
    )

    feature_style = ParagraphStyle(
        'matrix_feature',
        fontName=FONT_SANS,
        fontSize=FONT_SIZES['small'],
        textColor=COLORS['text_muted'],
    )

    cell_style = ParagraphStyle(
        'matrix_cell',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['small'],
        alignment=TA_CENTER,
    )

    # Format data
    formatted_headers = [Paragraph(h, header_style) for h in headers]
    formatted_rows = []
    for row in rows:
        formatted_row = [Paragraph(row[0], feature_style)]
        formatted_row += [Paragraph(cell, cell_style) for cell in row[1:]]
        formatted_rows.append(formatted_row)

    data = [formatted_headers] + formatted_rows

    table = Table(data, colWidths=col_widths)

    # Find TIPZ column index for highlighting
    tipz_col = headers.index('TIPZ') if 'TIPZ' in headers else -1

    style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['surface_light']),
        ('TOPPADDING', (0, 0), (-1, -1), SPACING['xs']),
        ('BOTTOMPADDING', (0, 0), (-1, -1), SPACING['xs']),
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]

    # Highlight TIPZ column
    if tipz_col > 0:
        style_commands.append(('BACKGROUND', (tipz_col, 0), (tipz_col, -1), HexColor('#1a2e1a')))

    table.setStyle(TableStyle(style_commands))

    return table


# =============================================================================
# PLACEHOLDER BOX
# =============================================================================
def create_placeholder(text, width=None, height=None):
    """
    Create a placeholder box for content to be filled later.

    Args:
        text: Placeholder text
        width: Optional width
        height: Optional height

    Returns:
        Table element
    """
    width = width or CONTENT_WIDTH
    height = height or 1.5 * inch

    style = ParagraphStyle(
        'placeholder_text',
        fontName=FONT_MONO,
        fontSize=FONT_SIZES['body'],
        textColor=COLORS['primary'],
        alignment=TA_CENTER,
    )

    data = [[Paragraph(text, style)]]

    table = Table(data, colWidths=[width], rowHeights=[height])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['surface']),
        ('BOX', (0, 0), (-1, -1), 1, COLORS['primary']),
        ('LINEBEFORE', (0, 0), (0, -1), 1, COLORS['primary']),
        ('LINEAFTER', (-1, 0), (-1, -1), 1, COLORS['primary']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))

    return table


# =============================================================================
# IMAGE WITH CAPTION
# =============================================================================
def create_image_with_caption(image_buffer, caption=None, width=None, height=None):
    """
    Create an image element with optional caption.

    Args:
        image_buffer: BytesIO buffer containing image
        caption: Optional caption text
        width: Image width
        height: Image height

    Returns:
        KeepTogether element with image and caption
    """
    elements = []

    # Calculate dimensions
    img = Image(image_buffer)
    if width:
        img.drawWidth = width
    if height:
        img.drawHeight = height
    elif width:
        # Maintain aspect ratio
        aspect = img.imageWidth / img.imageHeight
        img.drawHeight = width / aspect

    elements.append(img)

    if caption:
        caption_style = ParagraphStyle(
            'image_caption',
            fontName=FONT_SANS,
            fontSize=FONT_SIZES['small'],
            textColor=COLORS['text_dim'],
            alignment=TA_CENTER,
            spaceBefore=SPACING['xs'],
        )
        elements.append(Paragraph(caption, caption_style))

    return KeepTogether(elements)


# =============================================================================
# PAGE NUMBER FOOTER
# =============================================================================
def add_page_number(canvas, doc):
    """
    Add page number to footer.
    """
    page_num = canvas.getPageNumber()
    text = f"TIPZ Research | {page_num}"

    canvas.saveState()
    canvas.setFont(FONT_MONO, FONT_SIZES['tiny'])
    canvas.setFillColor(COLORS['text_dim'])
    canvas.drawCentredString(PAGE_WIDTH / 2, MARGIN / 2, text)
    canvas.restoreState()


def add_dark_background(canvas, doc):
    """
    Draw dark background on each page.
    """
    canvas.saveState()
    canvas.setFillColor(COLORS['background'])
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    canvas.restoreState()


def on_page(canvas, doc):
    """
    Combined page callback for background and page numbers.
    """
    add_dark_background(canvas, doc)
    add_page_number(canvas, doc)


# Export all components
__all__ = [
    'STYLES',
    'get_styles',
    'create_section_header',
    'create_stat_box',
    'create_stat_row',
    'create_data_table',
    'create_card',
    'create_bullet_list',
    'create_feature_matrix',
    'create_placeholder',
    'create_image_with_caption',
    'add_page_number',
    'add_dark_background',
    'on_page',
]
