# Camelot PDF Parser Prototype

This prototype uses [Camelot](https://camelot-py.readthedocs.io/) to extract tables from Mumbai University result PDFs with higher accuracy than regex-based parsing.

## Why Camelot?

- **Table-aware**: Specifically designed for PDF table extraction
- **High accuracy**: Uses computer vision to detect table boundaries
- **Open source**: No API costs or dependencies
- **Robust**: Handles complex layouts, merged cells, and multi-line text

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install system dependencies** (required for Camelot):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3-tk ghostscript
   
   # macOS
   brew install ghostscript tcl-tk
   ```

## Usage

```bash
python extract_tables.py
```

## Output

The script will:
1. Extract tables from the PDF
2. Show extraction accuracy for each table
3. Display detected student records
4. Compare with existing parser output (if available)

## Next Steps

1. Refine student record detection logic
2. Extract all fields (seat number, name, ERN, marks, etc.)
3. Create full JSON output matching existing format
4. Test with all pages of the PDF
5. Compare accuracy metrics with current parser
