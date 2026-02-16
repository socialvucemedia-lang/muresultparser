#!/usr/bin/env python3
"""
Explore PDF structure using pdfplumber for precise text extraction.
Uses character-level position data to identify table columns and extract data.
"""

import pdfplumber
import json
import re

pdf_path = "sample.pdf"

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    
    # Extract tables using pdfplumber's built-in table detection
    tables = page.extract_tables({
        "vertical_strategy": "text",
        "horizontal_strategy": "text",
        "snap_tolerance": 5,
        "join_tolerance": 3,
        "text_tolerance": 3,
        "intersection_tolerance": 10,
    })
    
    print(f"Found {len(tables)} tables on page 1")
    
    for i, table in enumerate(tables):
        print(f"\n{'='*80}")
        print(f"TABLE {i+1}: {len(table)} rows")
        print(f"{'='*80}")
        
        for row_idx, row in enumerate(table):
            cells = [str(c).strip() if c else '' for c in row]
            non_empty = [(j, c) for j, c in enumerate(cells) if c]
            if non_empty:
                print(f"\n--- Row {row_idx} ({len(row)} cols) ---")
                for j, c in non_empty:
                    print(f"  [{j}]: '{c[:80]}'")
    
    # Also try extracting raw text lines
    print(f"\n\n{'='*80}")
    print("RAW TEXT EXTRACTION")
    print(f"{'='*80}")
    text = page.extract_text()
    if text:
        for i, line in enumerate(text.split('\n')[:60]):
            print(f"  L{i:3d}: {line}")
