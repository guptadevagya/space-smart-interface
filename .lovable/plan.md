

# Plan: Hide UK-Fixed Sliders & Add Save/Load Configuration

## Changes

### 1. Hide Emergency C-Section Rate & Hypoxic Event Rate for UK region
**File: `src/components/dashboard/InputSidebar.tsx`** (lines 240-252)

Wrap the two sliders in a conditional so they only render when `inputs.region === 'US'`. The CP Risk slider remains visible for all regions. The Risk Ratios group title stays but only shows applicable sliders.

### 2. Add Save/Load Configuration with localStorage
**File: `src/pages/Index.tsx`**

- On mount, check `localStorage` for a saved configuration and load it if present
- Add a `saveConfiguration` function that persists the full `inputs` state (including references and bibliography) to `localStorage`
- Add a `loadConfiguration` function to restore from localStorage
- Pass save/load handlers down to the header or sidebar

**File: `src/components/dashboard/DashboardHeader.tsx`**

- Add a "Save Configuration" button (with a Save/Download icon) next to the existing controls
- Add a "Load Saved" button that restores the last saved state
- Show a toast notification on save/load using `sonner`

### 3. Add save indicator in sidebar footer
**File: `src/components/dashboard/InputSidebar.tsx`**

Replace the static footer text with a "Save Configuration" button so users have a clear, always-visible way to persist their changes (slider values, references, bibliography edits).

---

## Technical Details

- **localStorage key**: `oxnnet-simulator-config`
- Save the entire `SimulationInputs` object as JSON
- On load, validate the saved region matches or fall back to defaults
- Use `sonner` toast for "Configuration saved" / "Configuration loaded" feedback
- The save captures everything: slider values, `inputReferences` (assumption sources), and `bibliography` entries

