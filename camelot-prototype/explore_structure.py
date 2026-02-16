#!/usr/bin/env python3
"""
Explore the raw Camelot table structure to understand how student data is laid out.
Dumps full table content for analysis.
"""

import camelot
import pandas as pd
import json
from pathlib import Path

pdf_path = "sample.pdf"

print("=" * 80)
print("EXPLORING PDF TABLE STRUCTURE")
print("=" * 80)

# Extract tables with stream mode
tables = camelot.read_pdf(
    pdf_path,
    pages='1',       # Just page 1 for analysis
    flavor='stream',
    strip_text='\n',
    edge_tol=50,
    row_tol=10,
    column_tol=0
)

print(f"\nFound {len(tables)} tables on page 1\n")

for i, table in enumerate(tables):
    df = table.df
    print(f"\n{'='*80}")
    print(f"TABLE {i+1}: Shape={df.shape}, Accuracy={table.parsing_report['accuracy']:.2f}%")
    print(f"{'='*80}")
    
    # Print every row with its index
    for idx, row in df.iterrows():
        vals = [str(v).strip() for v in row.values if str(v).strip()]
        if vals:
            print(f"\n--- Row {idx} ---")
            for col_idx, val in enumerate(row.values):
                val_str = str(val).strip()
                if val_str:
                    print(f"  Col {col_idx}: '{val_str}'")
    
    # Also save full dataframe as CSV for inspection
    df.to_csv(f"table_{i+1}_page1.csv", index=True)
    print(f"\n  → Saved to table_{i+1}_page1.csv")

print("\n\nDone! Check the CSV files for full table data.")
