

# UI/UX Deep Dive + Data Verification Plan

## Part 1: UI/UX Audit (Apple HIG Alignment)

### Typography Issues

1. **Minimum font sizes violated** — Multiple instances of `text-[9px]` and `text-[10px]` throughout the app (KPI subtitles, section headers, references, sidebar labels). Apple HIG minimum for web is 10pt (~13px). These are illegible at distance and fail accessibility.
   - Files: `KPICards.tsx` (10px subtitles, 11px titles), `DashboardHeader.tsx` (9px "Total Impact" label, 10px timestamps), `StateMarketTable.tsx` (10px badges), `ReferencesPanel.tsx` (10px ref numbers), `InputSidebar.tsx` (10px helper text), `USHeatmap.tsx` (10px tooltip text)
   - **Fix**: Bump all `text-[9px]` to `text-xs` (12px) minimum. Bump `text-[10px]` to `text-xs`. Bump `text-[11px]` to `text-xs`.

2. **Type hierarchy inconsistency** — Section headers use `text-xs` uppercase tracking-widest, but card titles also use `text-sm font-bold`. The visual weight difference is too subtle. Apple HIG recommends clear size differentiation between hierarchy levels.
   - **Fix**: Make section headers `text-sm` and card titles `text-base`. Increase main KPI values from `text-xl` to `text-2xl` for stronger emphasis.

3. **Font weight overuse** — Almost everything is `font-bold` or `font-semibold`, reducing differentiation. HIG says use weight variation purposefully.
   - **Fix**: Reserve `font-bold` for primary values and headings. Use `font-medium` for labels, `font-normal` for body text.

### Spacing Issues

4. **Inconsistent padding** — Sidebar uses `p-4` internally but `px-5 py-4` for header. KPI cards use `p-4` while chart cards use default `p-6`. Main content uses `p-6 lg:p-10` creating different feel from sidebar.
   - **Fix**: Standardize card padding to `p-5`. Standardize section spacing to `space-y-10` (currently `space-y-8`). Keep sidebar at `p-4` (narrower context is fine).

5. **KPI card min-height** — `min-h-[120px]` is a magic number. Some cards have 2-line subtitles, others don't. Heights feel uneven.
   - **Fix**: Remove `min-h` and let content breathe naturally with consistent padding.

6. **Section gap between KPIs and charts** — Double empty line (line 396 in Index.tsx) creates irregular spacing.
   - **Fix**: Remove extra blank line; rely on `space-y-8` on parent.

### Color & Visual Issues

7. **Border-left accent on KPI cards** — `border-l-4` is a fine pattern but the color meanings aren't documented or consistent. Emerald for "benefit", blue for "revenue/savings", indigo for "litigation", amber for "cases", rose for "lives" — this is arbitrary.
   - **Fix**: Simplify to 2-3 semantic colors: green (positive financial), amber (clinical), red (cost/risk). Add a subtle legend or remove border colors entirely for cleaner HIG look.

8. **Chart tooltip cursor** — Uses `hsl(var(--muted) / 0.3)` which may not render correctly in all browsers (CSS variable in hsl function).
   - **Fix**: Use a direct color value or proper Tailwind class.

9. **Region selector pill** — Uses custom `bg-muted rounded-lg p-0.5` with inner `bg-card shadow-sm` for active. This is a solid segmented control pattern aligned with HIG. No change needed.

### Interaction Issues

10. **Slider field input width** — `w-24` is too narrow for large numbers like 3,628,934. The input truncates.
    - **Fix**: Widen to `w-28` or use `min-w-[7rem]`.

11. **No focus ring on custom buttons** — Many `<button>` elements lack `focus-visible:ring` styles (sidebar collapsible triggers, reference edit buttons, sort headers).
    - **Fix**: Add consistent focus-visible styles to all interactive elements.

12. **ResultsTable net total row** — The final row uses `bg-primary text-primary-foreground` but places the total in the last (Ref) column with `colSpan={3}` skipping middle columns. This is confusing layout.
    - **Fix**: Place total value in the "Financial Impact" column where users expect it.

---

## Part 2: Data & Calculations Verification

### US Model Numbers Check

Given defaults: 3,628,934 births, 8% FGR prevalence, 33% current detection, 66% OxNNet detection:

- **Total FGR**: 3,628,934 × 0.08 = 290,314.7 ✓
- **Avoided Undiagnosed**: 290,314.7 × (0.66 - 0.33) = 95,803.9 ✓ (matches screenshot)
- **Avoided C-Sections**: 95,803.9 × 0.40 = 38,321.6
- **C-Section Savings**: 38,321.6 × $28,998 = ~$1.11B ✓ (matches chart showing C-Section as largest bar ~$1.1B)
- **Avoided Hypoxic Events**: 95,803.9 × 0.011 = 1,053.8
- **NICU Days**: 1,053.8 × 7 = 7,376.9
- **NICU Savings**: 7,376.9 × $5,082 = ~$37.5M ✓ (matches small NICU bar)
- **CP Cases**: 1,053.8 × 0.25 = 263.5
- **CP Litigation**: 263.5 × 0.50 × $6,944,500 = ~$914.7M ✓
- **Stillbirths Avoided**: 95,803.9 × 0.0168 = 1,609.5 ✓ (matches "Lives Impacted" 1,609.5)
- **Fetal Death Savings**: 1,609.5 × $492,000 = ~$791.9M
- **Total Litigation**: $914.7M + $791.9M = ~$1.707B ✓ (matches $1,706,677,463)
- **Revenue**: High-risk cohort = (290,314.7 × 0.66) / (1 - 0.25) = 255,477.0; scans = 255,477 × 3 = 766,431; revenue = 766,431 × $180 = ~$137.96M ✓ (matches $137,957,555)
- **Total Impact**: $137.96M + $1.11B + $37.5M + $1.707B = ~$2.99B ✓ (matches $2,993,372,514)

**US numbers verified. All correct.**

### UK Model Numbers Check

Given defaults: 600,000 births, 8% FGR, 33.3% detection, 66.7% OxNNet:

- **Total FGR**: 48,000
- **Avoided Undiagnosed**: 48,000 × (2/3 - 1/3) = 16,000 ✓
- **Avoided C-Sections**: 16,000 × 0.15 = 2,400; savings = 2,400 × £3,019 = £7,245,600
- **Avoided Hypoxic**: 16,000 × 0.004 = 64
- **Mum stay savings**: 64 × £2,537.33 = £162,389
- **NICU**: 64 × 7 = 448 days; savings = 448 × £1,445 = £647,360
- **NICU on KPI card** shows £84,230,030 as "Clinical Savings" — this is totalClinicalSavings (all savings summed), not just NICU. ✓
- **Stillbirths**: 16,000 × 0.0168 = 268.8; savings = 268.8 × £4,191 = £1,126,541
- **CP**: 64 × 0.0585 = 3.744; savings = 3.744 × £18,500,000 = £69,264,000
- **NND**: 64 × 0.09 = 5.76; litigation = 5.76 × £500,000 = £2,880,000; trust = 5.76 × £4,191 = £24,140; total NND = £2,904,140
- **Total savings**: £7,245,600 + £162,389 + £647,360 + £1,126,541 + £69,264,000 + £2,880,000 + £2,904,140 = ~£84.2M ✓ (matches £84,230,030)
- **Screening cost**: high-risk current = (48000×1/3)/(1-0.5) = 32,000; high-risk Ox = (48000×2/3)/(1-0.2) = 40,000; additional = 8,000; costPerHR = 3×91 + 2×177.83 + (177.83-86.8) = 273 + 355.66 + 91.03 = £719.69; extra pathway = 8,000 × £719.69 = £5,757,520; Oxailis screening = 600,000 × 0.85 × £10 = £5,100,000; total = £10,857,520 ✓ (matches screenshot)
- **Net benefit**: £84,230,030 - £10,857,520 = £73,372,510 ✓ (matches £73,372,510)

**UK numbers verified. All correct.**

### Data Issues Found

13. **"Lives Impacted" includes avoidedNeonatalDeaths which is 0 for US** — The US formula set doesn't define `avoidedNND`, so the value falls back to 0. The "Lives Impacted" KPI shows only stillbirths (1,609.5) which is correct but the subtitle says "Avoided stillbirths & neonatal deaths" — slightly misleading for US since neonatal deaths aren't modeled.
    - **Fix**: Change US subtitle to "Avoided stillbirths" only.

14. **Decimal places on "Cases Identified"** — Shows 95,803.9 and "Lives Impacted" shows 1,609.5. Fractional people look odd.
    - **Fix**: Round to whole numbers in KPI display using `Math.round()` before formatting.

15. **ResultsTable net total misalignment** — The net total value is placed in the Ref column (last column) instead of Financial Impact column due to `colSpan` error. Line 296-298: `<TableCell colSpan={3} />` then value in next cell — this pushes value to column 5 (Ref) instead of column 4 (Impact).
    - **Fix**: Change to `colSpan={2}` so total aligns with Financial Impact column.

16. **State market table total** — `STATE_MARKET_DATA.reduce()` gives 3,628,709 vs `US_TOTAL_BIRTHS` constant of 3,628,934. Off by 225 births due to rounding in individual state data.
    - **Fix**: Add a note or adjust individual state figures to sum exactly to 3,628,934.

---

## Implementation Summary

### Files to edit:
1. **`src/index.css`** — No changes needed
2. **`src/components/dashboard/KPICards.tsx`** — Bump font sizes, round values, fix US subtitle
3. **`src/components/dashboard/DashboardHeader.tsx`** — Bump 9px label to 12px
4. **`src/components/dashboard/FinancialCharts.tsx`** — No critical changes
5. **`src/components/dashboard/ResultsTable.tsx`** — Fix colSpan alignment on net total row
6. **`src/components/dashboard/StateMarketTable.tsx`** — Bump tiny font sizes
7. **`src/components/dashboard/USHeatmap.tsx`** — Bump tooltip font sizes
8. **`src/components/dashboard/ReferencesPanel.tsx`** — Bump ref number sizes
9. **`src/components/dashboard/InputSidebar.tsx`** — Widen number input, bump helper text sizes
10. **`src/components/dashboard/FormulaExplorer.tsx`** — Bump tiny font sizes
11. **`src/pages/Index.tsx`** — Remove extra blank line, bump section header sizes

All changes are cosmetic typography/spacing adjustments and one table layout fix. No formula or data logic changes needed — all calculations are verified correct.

