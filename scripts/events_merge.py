#!/usr/bin/env python3
# === ETHDenver 2025 Lu.ma Merge Script (resilient version) ===

import pandas as pd
import os

# ------------------------------------------------------------------
# STEP 1. Read from your live Google Sheet (Categorized)
# ------------------------------------------------------------------
SHEET_ID = "1gd7YM2YtBj15IOun7OD7Gs-EkV06u8IscgS67P4Fet0"
SHEET_NAME = "Sheet1"  # change if needed
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}"

print("📥 Downloading latest data from Google Sheet...")
df_sheet = pd.read_csv(SHEET_URL)

# ------------------------------------------------------------------
# STEP 2. Load your enriched base CSV
# ------------------------------------------------------------------
ENRICHED_FILE = "ETHDenver2025_LumaOnly_Enriched.csv"
if not os.path.exists(ENRICHED_FILE):
    raise FileNotFoundError(f"❌ Could not find {ENRICHED_FILE} in the current directory.")

df_enriched = pd.read_csv(ENRICHED_FILE)

# ------------------------------------------------------------------
# STEP 3. Normalize column names
# ------------------------------------------------------------------
df_enriched.columns = [c.strip().lower() for c in df_enriched.columns]
df_sheet.columns = [c.strip().lower().replace(" ", "_") for c in df_sheet.columns]

# ------------------------------------------------------------------
# STEP 4. Filter for Lu.ma events only
# ------------------------------------------------------------------
df_enriched = df_enriched[df_enriched["registration_url"].astype(str).str.contains("lu.ma", case=False, na=False)]
df_sheet = df_sheet[df_sheet["registration"].astype(str).str.contains("lu.ma", case=False, na=False)]

# ------------------------------------------------------------------
# STEP 5. Keep only rows with non-empty descriptions
# ------------------------------------------------------------------
df_sheet = df_sheet[df_sheet["description"].notna() & (df_sheet["description"].astype(str).str.strip() != "")]

# ------------------------------------------------------------------
# STEP 6. Merge
# ------------------------------------------------------------------
merged = pd.merge(df_enriched, df_sheet, how="inner", left_on="registration_url", right_on="registration")

print(f"🔗 Matched {len(merged)} rows out of {len(df_enriched)} enriched events.")

# ------------------------------------------------------------------
# STEP 7. Safely update description, attendees, and categories
# ------------------------------------------------------------------
if "description_y" in merged.columns and "description_x" in merged.columns:
    merged["description"] = merged["description_y"].combine_first(merged["description_x"])
elif "description_y" in merged.columns:
    merged["description"] = merged["description_y"]
else:
    merged["description"] = merged.get("description", "")

if "attendees_shown_y" in merged.columns and "attendees_shown_x" in merged.columns:
    merged["attendees_shown"] = merged["attendees_shown_y"].combine_first(merged["attendees_shown_x"])
elif "attendees_shown_y" in merged.columns:
    merged["attendees_shown"] = merged["attendees_shown_y"]
elif "attendees_shown_x" in merged.columns:
    merged["attendees_shown"] = merged["attendees_shown_x"]
else:
    merged["attendees_shown"] = None

merged["categories"] = merged.get("categories", "")

# ------------------------------------------------------------------
# STEP 8. Clean redundant columns
# ------------------------------------------------------------------
for col in ["description_x","description_y","attendees_shown_x","attendees_shown_y","registration"]:
    if col in merged.columns:
        merged.drop(columns=col, inplace=True)

# ------------------------------------------------------------------
# STEP 9. Reorder columns and export
# ------------------------------------------------------------------
col_order = [c for c in df_enriched.columns if c in merged.columns] + ["categories"]
merged = merged[col_order]

OUTPUT_FILE = "ETHDenver2025_LumaOnly_Enriched_Final.csv"
merged.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")

print(f"✅ Merge complete! Saved: {OUTPUT_FILE}")
print(f"📊 Final row count: {len(merged)}")
