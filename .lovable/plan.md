

# Plan: Formula Transparency UI

## Understanding

The goal is to replace the "black box" feel of the current model with Excel-like transparency. Users should see exactly how each output is calculated — the formula, which inputs feed into it, and the resulting value — all in a clean UI. This gives non-technical users the confidence and control they'd have in a spreadsheet, without needing Excel.

## Design

A new **"Formula Explorer"** section will be added between the Detailed Analysis table and the Evidence Base. Each calculation step is shown as a card with:

```text
┌──────────────────────────────────────────────────────────────┐
│  Avoided Undiagnosed FGR Cases                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  (Annual Births × FGR Prevalence × Current Detection)  │  │
│  │  − (Annual Births × FGR Prevalence × OxNNet Detection) │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  (5,000 × 8.0% × 33%) − (5,000 × 8.0% × 66%)              │
│                                                              │
│  = 132 cases avoided                                         │
│                                                              │
│  Inputs: Annual Births (5,000) · FGR Prevalence (8.0%)      │
│          Current Detection (33%) · OxNNet Detection (66%)    │
└──────────────────────────────────────────────────────────────┘
```

Each input mentioned in the formula is a clickable chip that highlights which sidebar slider controls it. The formulas are region-aware (UK shows the fixed 15% C-section rate and 0.4% hypoxic rate as constants rather than inputs).

## Changes

### 1. New component: `src/components/dashboard/FormulaExplorer.tsx`

A collapsible section containing formula cards grouped by stage:

**Group 1 — Demographics:**
- Total FGR = Annual Births × FGR Prevalence
- Undiagnosed (Current) = Total FGR × (1 − Current Detection Rate)
- Undiagnosed (OxNNet) = Total FGR × (1 − OxNNet Detection Rate)
- Avoided Undiagnosed = Undiagnosed Current − Undiagnosed OxNNet

**Group 2 — Clinical Outcomes:**
- Avoided C-Sections = Avoided Undiagnosed × C-Section Rate (UK: fixed 15%)
- Avoided Hypoxic Events = Avoided Undiagnosed × Hypoxic Rate (UK: fixed 0.4%)
- Avoided NICU Days = Avoided Hypoxic Events × 7
- Avoided CP Cases = Avoided Hypoxic Events × CP Risk
- Avoided Stillbirths = Avoided Undiagnosed × 1.68%
- (UK only) Avoided NND = Avoided Hypoxic Events × 9%

**Group 3 — Financial Impact:**
- C-Section Savings = Avoided C-Sections × C-Section Cost
- NICU Savings = Avoided NICU Days × NICU Daily Cost
- (UK) Mum Extra Stay Savings = Avoided Hypoxic Events × £2,537
- Litigation Savings = (CP Cases × CP Litigation) + (Stillbirths × Stillbirth Cost) + (UK: NND × NND Cost)
- (UK) Screening Cost Increase = (High Risk OxNNet − High Risk Current) × Cost per High-Risk Patient
- Net Benefit = Total Clinical Savings − Screening Cost Increase

Each formula card will show:
1. **Title** — the output name
2. **Formula** — rendered in a mono-font code block with readable variable names
3. **Substitution** — the same formula with actual current values plugged in
4. **Result** — the computed value, formatted with currency/number
5. **Input chips** — small badges for each input variable, showing name and current value

The component receives `inputs` and `results` as props and is purely presentational — it reads from the existing calculation, it does not re-implement formulas.

### 2. Update `src/pages/Index.tsx`

Add a new section between "Detailed Analysis" and "Evidence Base":

```
{/* Section 3.5: Formulas */}
<section>
  <h2>Model Formulas</h2>
  <FormulaExplorer inputs={inputs} results={results} formatCurrency={...} formatNumber={...} />
</section>
```

### 3. Formula card sub-component design

Each card uses existing UI primitives:
- `Card` for the container
- `Badge` variant="outline" for input variable chips
- `Collapsible` so users can expand/collapse individual formulas
- Region-conditional rendering (UK constants shown as literal values with a "Fixed" badge, US values shown as adjustable input chips)

The entire section is wrapped in a `Collapsible` that defaults to closed, keeping the dashboard clean for users who don't need formula-level detail.

## Technical Details

- No new dependencies required — uses existing `Card`, `Badge`, `Collapsible` components
- No changes to `modelLogic.ts` — the formula explorer is a read-only visualization of the existing logic
- Region-aware: UK formulas show hardcoded constants (0.15, 0.004, 0.09, 2537) with "Fixed" labels; US formulas show all values as input-linked
- Approximately 300-400 lines for the new component, structured as a list of formula definitions rendered by a shared `FormulaCard` sub-component

