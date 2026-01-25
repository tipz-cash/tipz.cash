# TIPZ Research PDF Generator

Generate professional, VC-ready research documents for TIPZ.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Generate PDF
python generate_pdf.py

# Custom output name
python generate_pdf.py --output my_custom_name.pdf
```

## Output

Generates `tipz_market_research.pdf` - an 18+ page research document including:

1. Cover page
2. Executive summary
3. Problem analysis (fees, surveillance)
4. Market opportunity (creator economy, tipping market, Zcash)
5. Competitive landscape
6. TIPZ solution
7. Business model & projections
8. Go-to-market strategy
9. Team & advisors (placeholder)
10. Traction & metrics (placeholder)
11. Investment opportunity
12. Sources appendix

## Customizing Content

### Update Data
Edit `data.py` to update:
- Market statistics
- Competitor information
- Feature comparisons
- Projections
- Team/traction placeholders

### Update Styling
Edit `styles.py` to change:
- Colors (TIPZ brand palette)
- Typography
- Spacing
- Component styles

### Update Charts
Edit `charts.py` to modify:
- Chart types and layouts
- Data visualizations
- Color schemes

## Project Structure

```
tipz/research/
├── generate_pdf.py    # Main generation script
├── styles.py          # Colors, fonts, layouts
├── data.py            # All statistics and content
├── charts.py          # Chart generation (matplotlib)
├── components.py      # Reusable PDF components
├── requirements.txt   # Python dependencies
└── assets/
    └── fonts/         # Custom fonts (optional)
```

## Placeholder Sections

The following sections contain placeholder content marked with `[PLACEHOLDER]`:

- **Team & Advisors**: Add founder bios, photos, and advisor information
- **Traction & Metrics**: Update with current metrics, partnerships, grants

## Dependencies

- `reportlab>=4.0.0` - PDF generation
- `matplotlib>=3.7.0` - Chart creation
- `Pillow>=9.0.0` - Image handling
- `numpy>=1.24.0` - Numerical operations
