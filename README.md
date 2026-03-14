# OxNNet Health Economics Dashboard

An interactive simulation dashboard for modelling the health-economic impact of OxNNet-based fetal growth restriction (FGR) screening versus current clinical pathways.

---

## What This Does

The dashboard allows you to:

- Compare **current screening** versus **OxNNet (Oxailis) screening** for fetal growth restriction
- Model cost savings to the NHS across C-sections, NICU stays, litigation, and stillbirths
- Adjust clinical assumptions, prevalence rates, and cost parameters in real time
- View detailed financial breakdowns, charts, and clinical outcome projections
- Export/print full reports with references and assumptions

Default configuration models **600,000 annual UK births** and produces:

| Metric | Value |
|---|---|
| Gross savings to NHS | £84,230,031 |
| Net benefit (after screening costs) | £73,372,511 |
| Stillbirths avoided | 269 |
| Caesarean sections avoided | 2,400 |
| Cases of cerebral palsy avoided | 4 |

---

## Local Setup Guide

No prior coding experience is required.

### Prerequisites

- A computer running Windows 10+, macOS, or Linux
- An internet connection (for initial setup only)
- Approximately 500 MB of free disk space

### Step 1 — Install Node.js

1. Visit [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** (Long Term Support) version
3. Run the installer using the default settings
4. Restart your computer after installation

To confirm the installation was successful, open a terminal and run:

```
node --version
```

You should see a version number (e.g. `v20.11.0`).

**How to open a terminal:**
- Windows: Press `Win + R`, type `cmd`, press Enter
- macOS: Open Spotlight (`Cmd + Space`), type `Terminal`, press Enter

### Step 2 — Download the Project

**Option A — Download as ZIP**

1. Click the green **Code** button on this page, then select **Download ZIP**
2. Extract the ZIP file to a location of your choice

**Option B — Clone with Git** (if Git is installed)

```
git clone <REPOSITORY_URL>
```

### Step 3 — Open a Terminal in the Project Folder

**Windows:**
1. Open File Explorer and navigate to the extracted project folder
2. Click the address bar at the top of the window
3. Type `cmd` and press Enter

**macOS:**
1. Open Terminal
2. Type `cd ` (including the trailing space)
3. Drag the project folder from Finder into the Terminal window
4. Press Enter

To verify you are in the correct directory, run:

```
ls
```

You should see files such as `package.json`, `src`, and `README.md`.

### Step 4 — Install Dependencies

```
npm install
```

This takes 1–3 minutes. Warning messages are normal; errors appear in red starting with `ERR!`.

### Step 5 — Start the Dashboard

```
npm run dev
```

Once ready, you will see output similar to:

```
VITE v5.x.x  ready in 500ms
  Local:   http://localhost:8080/
```

Open your browser and navigate to **http://localhost:8080**.

---

## Daily Usage

| Action | Command |
|---|---|
| Start the dashboard | `npm run dev` |
| Stop the dashboard | `Ctrl + C` in the terminal |
| Restart the dashboard | Stop, then start again |

All configuration changes are saved automatically in your browser's local storage. No internet connection is needed after initial setup. Clearing browser data will reset saved configurations.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── DashboardHeader.tsx
│   │   ├── FinancialCharts.tsx
│   │   ├── FormulaExplorer.tsx
│   │   ├── InputSidebar.tsx
│   │   ├── KPICards.tsx
│   │   ├── ReferencesPanel.tsx
│   │   └── ResultsTable.tsx
│   └── ui/                 # Reusable UI primitives (shadcn)
├── lib/                    # Core logic and configuration
│   ├── constants.ts        # Default inputs, references, bibliography
│   ├── defaultFormulas.ts  # Formula definitions per region
│   ├── formulaEngine.ts    # Math expression evaluator
│   ├── modelLogic.ts       # Direct calculation functions
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
├── pages/
│   └── Index.tsx           # Main dashboard page
└── test/                   # Test configuration
```

---

## Technology Stack

- **React** + **TypeScript** — UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Styling
- **Recharts** — Charts and data visualisation
- **mathjs** — Formula evaluation engine
- **shadcn/ui** — UI component library

---

## Troubleshooting

**"node is not recognized" / "command not found: node"**
Node.js is not installed or the system PATH was not updated. Reinstall Node.js and restart your computer.

**"npm ERR! code ENOENT"**
The terminal is not in the correct directory. Ensure you are inside the project folder.

**Blank page or application error**
Run `npm install` then `npm run dev`. If the issue persists, check the terminal for error messages.

**"Port 8080 is already in use"**
Close the other application using the port, or check the terminal — the dashboard may have started on an alternative port.

---

## Quick Reference

```bash
# First-time setup (once):
npm install

# Start the dashboard:
npm run dev

# Open in browser:
http://localhost:8080

# Stop the dashboard:
Ctrl + C
```
