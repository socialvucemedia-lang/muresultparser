#!/usr/bin/env python3
"""
Camelot-based PDF Parser for Mumbai University Result Gazettes
Extracts student records with better accuracy than regex-based parsing
"""

import camelot
import pandas as pd
import json
import re
from pathlib import Path


class MUResultParser:
    """Parser for Mumbai University result PDFs using Camelot"""
    
    # Subject mapping
    SUBJECT_NAMES = {
        "10411": "Applied Mathematics-I",
        "10412": "Applied Physics",
        "10413": "Applied Chemistry",
        "10414": "Engineering Mechanics",
        "10415": "Basic Electrical & Electronics Engineering",
        "10416": "Applied Physics Lab",
        "10417": "Applied Chemistry Lab",
        "10418": "Engineering Mechanics Lab",
        "10419": "Basic Electrical & Electronics Lab",
        "10420": "Professional Communication Ethics",
        "10421": "Professional Communication Ethics TW",
        "10422": "Engineering Workshop-I",
        "10423": "C Programming",
        "10424": "Induction cum Universal Human Values",
    }
    
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.students = {}
        
    def extract_tables(self, pages='all', flavor='stream'):
        """Extract all tables from PDF using Camelot"""
        print(f"📄 Extracting tables from {self.pdf_path}...")
        print(f"   Using {flavor} mode...")
        
        try:
            if flavor == 'lattice':
                tables = camelot.read_pdf(
                    str(self.pdf_path),
                    pages=pages,
                    flavor='lattice',
                    strip_text='\n'
                )
            else:  # stream mode
                tables = camelot.read_pdf(
                    str(self.pdf_path),
                    pages=pages,
                    flavor='stream',
                    strip_text='\n',
                    edge_tol=50,  # Increase tolerance for edge detection
                    row_tol=10,   # Tolerance for row detection
                    column_tol=0  # Strict column detection
                )
            print(f"✅ Found {len(tables)} tables")
            return tables
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def is_valid_ern(self, text):
        """Check if text is a valid ERN (MU + 16 digits)"""
        if not text:
            return False
        clean = re.sub(r'[^\w]', '', str(text))
        return bool(re.match(r'^MU\d{16}$', clean))
    
    def extract_ern(self, text):
        """Extract ERN from text"""
        if not text:
            return None
        match = re.search(r'(MU\d{16})', str(text))
        return match.group(1) if match else None
    
    def parse_student_records(self, tables):
        """Parse student records from extracted tables"""
        students = []
        
        for table_idx, table in enumerate(tables):
            df = table.df
            print(f"\n📊 Table {table_idx + 1}:")
            print(f"   Shape: {df.shape}")
            print(f"   Parsing accuracy: {table.parsing_report['accuracy']:.2f}%")
            
            # Display first few rows for debugging
            print("\n   First few rows:")
            print(df.head().to_string())
            
            # Try to identify student records
            # Usually, seat numbers are 7 digits followed by name
            for idx, row in df.iterrows():
                row_text = ' '.join(row.astype(str).values)
                
                # Look for seat number pattern (7 digits)
                seat_match = re.search(r'\b(\d{7})\b', row_text)
                if seat_match:
                    print(f"\n   🎓 Found potential student at row {idx}: {row_text[:100]}")
        
        return students
    
    def save_to_json(self, output_path):
        """Save parsed data to JSON"""
        with open(output_path, 'w') as f:
            json.dump(self.students, f, indent=2)
        print(f"✅ Saved results to {output_path}")
    
    def compare_with_existing(self, existing_json_path):
        """Compare with existing parser output"""
        with open(existing_json_path, 'r') as f:
            existing = json.load(f)
        
        print(f"\n📊 Comparison:")
        print(f"   Existing parser: {len(existing)} students")
        print(f"   Camelot parser: {len(self.students)} students")
        
        # Find missing ERNs
        existing_erns = set(existing.keys())
        new_erns = set(self.students.keys())
        
        missing = existing_erns - new_erns
        extra = new_erns - existing_erns
        
        if missing:
            print(f"   ⚠️  Missing {len(missing)} students")
        if extra:
            print(f"   ✨ Found {len(extra)} additional students")


def main():
    """Main execution"""
    print("🚀 Mumbai University Result Parser - Camelot Edition\n")
    
    # Paths
    pdf_path = Path("sample.pdf")
    output_path = Path("camelot_output.json")
    existing_json = Path("../public/data/mechanical.json")
    
    if not pdf_path.exists():
        print(f"❌ Error: {pdf_path} not found!")
        return
    
    # Initialize parser
    parser = MUResultParser(pdf_path)
    
    # Extract tables (stream mode works better for text-based tables)
    tables = parser.extract_tables(pages='1-3', flavor='stream')  # Test first 3 pages
    
    # Parse student records
    students = parser.parse_student_records(tables)
    
    # Save results
    # parser.save_to_json(output_path)
    
    # Compare with existing if available
    if existing_json.exists():
        parser.compare_with_existing(existing_json)
    
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
