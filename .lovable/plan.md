

# UI/UX Polish + Clickable Map Plan

## Overview

Three focus areas: (1) Provider Comparison card refinement, (2) softer pastel heatmap with click-to-select-state, (3) typography/spacing consistency pass per Apple HIG.

---

## 1. Provider Comparison Cards — Cleaner, HIG-aligned

**File: `src/components/dashboard/ProviderComparison.tsx`**

- Remove `border-l-4` colored accents — replace with a subtle top-border or no border, cleaner Apple aesthetic
- Increase card padding consistency to `p-6`
- Use `text-sm` for title labels (currently `text-xs` uppercase feels cramped)
- Use `text-3xl font-semibold` for values (Apple uses large, medium-weight numbers)
- Replace colored icon backgrounds with a lighter `bg-muted/50` circle
- Add a subtle description line under the value showing the provider name (e.g. "HCA Healthcare")
- Increase gap between cards from `gap-3` to `gap-4`
- Change grid from `lg:grid-cols-5` to a responsive `lg:grid-cols-5` with `min-h` removed, let cards breathe

## 2. US Heatmap — Soft Pastels + Click-to-Select

**File: `src/components/dashboard/USHeatmap.tsx`**

**Color palette change:**
- No providers: `hsl(220, 14%, 96%)` (very light cool gray)
- Low density: `hsl(210, 60%, 88%)` (soft sky blue)
- Medium density: `hsl(210, 55%, 72%)` (medium pastel blue)
- High density: `hsl(210, 50%, 58%)` (deeper but still soft blue)
- Strokes: lighter `hsl(210, 20%, 82%)` for inactive, `hsl(210, 40%, 65%)` for active
- Legend updated to match new pastel scale

**Click-to-select state:**
- Add `selectedState` state variable
- Add `onClick` handler to each state in `customStates`
- Clicking a state sets `selectedState`, shows a persistent info panel (not just hover)
- Clicked state gets a distinct stroke (e.g. `hsl(210, 60%, 45%)` with `strokeWidth: 2`)
- The tooltip/info panel becomes persistent when a state is selected (click again or click elsewhere to deselect)
- Show full state details: name, births/yr, tracked systems, largest provider, market control %, top-3 combined %

**File: `src/pages/Index.tsx`** — Pass any needed callbacks if state selection should affect other components (for now, self-contained in heatmap).

## 3. Global Typography & Spacing Pass

**Files: `KPICards.tsx`, `DashboardHeader.tsx`, `InputSidebar.tsx`, `ProviderComparison.tsx`**

- Ensure all labels use `text-xs font-medium` (not `font-semibold` or `font-bold` for labels)
- Reserve `font-bold` only for primary values and page titles
- Section headers (`h2` in Index.tsx): keep `text-sm font-bold uppercase tracking-widest`
- KPI card values: ensure `text-2xl font-semibold` (not bold — Apple uses medium/semibold for numbers)
- Card titles in chart sections: `text-sm font-semibold` (not `font-bold`)
- DashboardHeader `text-[10px]` instances bumped to `text-xs`
- Standardize all card `CardContent` padding to `p-5` or `p-6` consistently

---

## Technical Summary

| File | Changes |
|------|---------|
| `ProviderComparison.tsx` | Remove border-l accents, increase padding, softer typography hierarchy, add provider name subtitle |
| `USHeatmap.tsx` | Pastel color palette, add `selectedState` + onClick, persistent info panel, updated legend |
| `KPICards.tsx` | `font-bold` → `font-semibold` on values |
| `DashboardHeader.tsx` | Bump remaining `text-[10px]` to `text-xs` |
| `Index.tsx` | No structural changes needed |

