

# Add US Provider Profiles (IDN/IPP) to Dashboard

## Summary

Add a provider profile system to the US model so users can view the impact analysis at three levels: overall national (3.6M births), per individual IDN, or per individual IPP. A dropdown in the sidebar lets the user pick a specific health system or "All U.S." to see how the model scales to that system's birth volume.

## What Changes

### 1. Provider Data (new file: `src/lib/providerProfiles.ts`)

A static dataset of the Top 20 health systems from your market concentration document:

| System | Type | Births |
|--------|------|--------|
| HCA Healthcare | IDN | 212,000 |
| Kaiser Permanente | IPP | 116,000 |
| CommonSpirit Health | IDN | 85,000 |
| Ascension | IDN | 75,753 |
| Advocate Health | IDN | 65,000 |
| Providence | IDN | 60,000 |
| Trinity Health | IDN | 50,000 |
| Tenet Healthcare | IDN | 45,000 |
| Baylor Scott & White | IDN | 40,000 |
| AdventHealth | IDN | 40,000 |
| Intermountain Health | IPP | 37,477 |
| UHS | IDN | 34,900 |
| Northwell Health | IDN | 30,500 |
| Corewell Health | IDN | 28,000 |
| Sutter Health | IDN | 26,000 |
| UPMC | IPP | 25,000 |
| Mass General Brigham | IDN | 22,000 |
| UC Health | IDN | 20,000 |
| Cleveland Clinic | IDN | 15,000 |
| Mayo Clinic | IDN | 15,000 |

Each entry includes: name, type (IDN or IPP), birth volume, states operated, and source type.

### 2. Sidebar UI Changes (`InputSidebar.tsx`)

Replace the current "Hospital Profile" section (US mode only) with a "Provider Profile" section containing:

- **Provider Type toggle**: "All U.S." / "IDN" / "IPP"
  - "All U.S." shows the national 3,628,934 births total
  - "IDN" filters the dropdown to IDN systems only
  - "IPP" filters the dropdown to IPP systems only
- **Provider dropdown**: Select a specific system (e.g., "HCA Healthcare - 212,000 births") or "All IDNs" / "All IPPs" for the aggregate
- When a specific provider is selected, Annual Births auto-fills with that system's birth volume and locks the slider
- When "All U.S." is selected, the slider stays at 3,628,934 and is adjustable

UK/Global modes are unchanged and keep the current "Hospital Profile" section as-is.

### 3. State Changes (`types.ts` and `Index.tsx`)

Add to types:
- `providerType`: `'all' | 'idn' | 'ipp'` (new field, US only)
- `selectedProvider`: `string | null` (provider ID or null for aggregate)

Add state in `Index.tsx` to track the selected provider, and pass it down. When a provider is selected, override `annualBirths` in the inputs before calculation.

### 4. Dashboard Header Context

When a specific provider is selected, show its name in the header subtitle (e.g., "HCA Healthcare (IDN) - 212,000 births") so the user knows which profile they're viewing.

### 5. Results Table / KPI Context

Add a small label above the results showing "Viewing: All U.S. (3,628,934 births)" or "Viewing: Kaiser Permanente (IPP - 116,000 births)" so the output context is always clear.

## Files Modified

1. **New**: `src/lib/providerProfiles.ts` - Provider dataset
2. `src/lib/types.ts` - Add providerType and selectedProvider fields
3. `src/components/dashboard/InputSidebar.tsx` - Provider profile selector UI (US only)
4. `src/pages/Index.tsx` - Provider selection state management
5. `src/components/dashboard/DashboardHeader.tsx` - Show active provider context
6. `src/components/dashboard/KPICards.tsx` - Show provider label

## What Stays the Same

- UK and Global models are completely untouched
- All calculation logic in `modelLogic.ts` stays the same (it just receives different `annualBirths`)
- Formula engine, charts, references panel all work as before
- The existing approved plan for updating US default values (costs, litigation, etc.) is independent and can be done before or after this

