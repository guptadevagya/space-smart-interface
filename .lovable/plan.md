

# Restructure US Sidebar + Add Heatmap + Update References

## Summary

Split the US sidebar into separate "Country Profile" and "Provider Profile" cards, add a US state heatmap showing IDN/IPP geographic presence, enhance charts with provider context, and update the US assumptions register and references to match the recalibrated data.

## Changes

### 1. InputSidebar.tsx - Split US into two sections

Currently the US has one "Provider Profile" group that mixes national births with IDN/IPP selection. Split into:

- **Country Profile** (always visible for US): Shows "Annual Births" locked at 3,628,934 for the whole US. Not editable -- just a display card showing the national context. Same as UK's "Hospital Profile" concept.
- **Provider Profile** (US only, below Country Profile): The IDN/IPP toggle and provider dropdown. When a provider is selected, a secondary "Provider Births" value shows that system's volume. The model runs using the *provider's* birth volume but the national total is always visible above.

This mirrors the UK "Hospital Profile" pattern -- UK shows one card with annual births, US shows country + provider.

### 2. New Component: USHeatmap.tsx

An SVG-based US state map that color-codes states by IDN/IPP presence.

- Use a simplified inline SVG path dataset for all 50 US states (standard approach, no external dependency needed).
- When "All U.S." is selected: states with any provider colored by count (more systems = darker).
- When "IDN" or "IPP" is selected: only states with that type highlighted.
- When a specific provider is selected: only that provider's states highlighted.
- Tooltip on hover shows state name + which systems operate there.
- Placed in the dashboard main area, either as a new section between KPIs and Charts, or as a third chart card.

### 3. FinancialCharts.tsx - Add provider context

- When a specific provider is selected, add the provider name to chart titles.
- For the US savings breakdown, split litigation bar into "CP Litigation" and "Fetal Death" (two separate bars) to match the recalibrated model.
- Keep the same chart structure as UK (two charts side by side) for consistency.

### 4. ReferencesPanel.tsx - Update US assumptions register

Currently the assumptions register shows the same 8 rows regardless of region. For US, add rows for:
- Screening Uptake (combinedTestRate)
- Fetal Death Payout (fetalDeathPayout)  
- Litigation Success Rate (litigationSuccessRate)
- Scan Reimbursement (scanReimbursement)
- Emergency C-Section Rate (emergencyCSectionRateUndiagnosed)

These parameters already exist in the model but are missing from the register display.

### 5. ResultsTable.tsx - Split US litigation rows

Currently US shows "Major Morbidity Avoided (CP + Stillbirth)" as one row. Split into:
- CP Litigation Avoided (cases x success rate x $6.9M)
- Fetal Death Litigation Avoided (stillbirths x $492K)

This matches the separated logic already in modelLogic.ts.

## Files Modified

1. `src/components/dashboard/InputSidebar.tsx` - Split US section into Country Profile + Provider Profile
2. `src/components/dashboard/USHeatmap.tsx` (new) - SVG state heatmap component  
3. `src/components/dashboard/FinancialCharts.tsx` - Split US litigation bar, add provider context
4. `src/components/dashboard/ResultsTable.tsx` - Split US litigation into CP + Fetal Death rows
5. `src/components/dashboard/ReferencesPanel.tsx` - Add US-specific assumption rows
6. `src/pages/Index.tsx` - Pass provider props to new heatmap + charts

## What stays the same

- UK and Global models completely untouched (UK is the reference, US adapts to match its structure)
- All calculation logic in modelLogic.ts unchanged
- Formula engine, custom parameters all work as before
- Provider data in providerProfiles.ts unchanged

