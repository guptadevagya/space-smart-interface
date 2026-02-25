

# OxNNet NHS Economic Impact Simulator — UI/UX Refinement Plan

## Overview
Rebuild and refine the existing OxNNet economic impact simulator into a polished, interactive dashboard. The app models the financial and clinical impact of AI-powered FGR (Fetal Growth Restriction) detection in hospitals, with full UK market math from the Excel sheet and US market support.

---

## Page 1: Main Dashboard

### Top Navigation Bar
- OxNNet logo/brand on the left
- Region selector tabs (UK / US / Global) prominently displayed
- A "Reset to Defaults" button
- Optional dark/light mode toggle

### Left Sidebar — Interactive Inputs Panel
- **Collapsible accordion sections** for organized input groups:
  1. **Hospital Profile** — Annual births slider (range: 1,000–50,000)
  2. **Clinical Assumptions** — FGR prevalence, detection rates (current vs OxNNet), false positive rates
  3. **Cost Parameters** — Region-specific costs (C-section, NICU, litigation, scan costs for UK, reimbursement for US)
  4. **Risk Ratios** — Emergency C-section rate, hypoxic event rate, CP risk
- Each input has:
  - A slider + numeric input field for precise control
  - An info tooltip icon showing the source/reference from the Excel bibliography
  - Visual indicator when value differs from default
- **Live calculation** — results update instantly as inputs change

### Main Content Area — Results Dashboard

#### KPI Summary Row (Top)
- 4–6 large KPI cards in a responsive grid:
  - **Net Economic Benefit** (headline number, highlighted)
  - **Avoided Undiagnosed Cases**
  - **Clinical Savings** (C-section + NICU + mum's stay)
  - **Litigation Savings** (CP + NND + Stillbirth)
  - **Screening Cost Increase** (shown as cost, UK-specific)
  - **Lives Impacted** (avoided stillbirths + neonatal deaths)
- Cards show the number with a small label, formatted with £/$ based on region
- Subtle animation when values update

#### Charts Section (Middle)
- **Financial Breakdown Bar Chart** — Stacked or grouped bars showing savings by category vs. screening cost increase, matching the Excel's cost-benefit structure
- **Detection Funnel Chart** — Visual showing total births → FGR cases → detected (current vs OxNNet) → undiagnosed gap
- **Clinical Outcomes Comparison** — Side-by-side bars: current pathway vs OxNNet pathway for C-sections, hypoxic events, stillbirths, CP cases

#### Detailed Results Table (Bottom)
- Expandable table with all calculated values organized by:
  - Demographics & Detection
  - Screening Costs (UK) / Revenue (US)
  - Clinical Outcomes Avoided
  - Financial Impact
- Each row shows the metric name, current pathway value, OxNNet pathway value, and the difference/savings

### Right Panel — References & Sources
- Collapsible panel showing bibliography entries
- Each input links to its source reference
- Formatted citations from the Excel sheet's bibliography

---

## Calculation Engine
- Port the complete `modelLogic.ts` with both US and UK calculation paths
- UK model matches the Excel sheet exactly:
  - High-risk cohort sizing from FPR
  - Cost per high-risk pregnancy (3 scans + 2 consultant + 1 midwife upgrade)
  - Screening cost delta
  - C-section savings at 15% avoided rate
  - Hypoxic events at 0.4% excess risk
  - Mum's extra stay at £2,537
  - Stillbirth at 1.68% of undiagnosed
  - NND at 9% of hypoxic events
  - Net benefit = clinical savings − screening cost increase
- All default values from `constants.ts` preserved

---

## Design & UX Improvements
- **Responsive layout** — works on desktop and tablet
- **Better use of space** — full-width dashboard with sidebar that can collapse on smaller screens
- **Color coding** — green for savings, red for costs, blue for clinical outcomes
- **Number formatting** — proper currency (£/$ based on region), comma separators, rounding
- **Hover states** — tooltips on charts showing exact values
- **Smooth transitions** — animate KPI cards and charts when inputs change
- **Professional theme** — clean, medical/fintech aesthetic with the existing shadcn/ui component library

---

## Technical Approach
- All frontend, no backend needed (pure client-side calculations)
- Use existing shadcn/ui components (cards, tabs, accordion, sliders, tooltips)
- Recharts for all data visualizations
- React state management for live input → output reactivity
- TypeScript types from `types.ts` preserved

