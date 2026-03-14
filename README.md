# OxNNet Health Economics Dashboard

A simulation dashboard that models the health and economic impact of using OxNNet screening for fetal growth restriction (FGR) compared to current methods.

---

## What This Does

- Compare current FGR screening with OxNNet (Oxailis) screening
- See projected cost savings across C-sections, NICU stays, litigation, and stillbirths
- Adjust clinical assumptions and cost parameters in real time
- View financial breakdowns, charts, and clinical outcome projections
- Print full reports with references and assumptions

---

## Setup Guide

No coding experience is needed.

### What You Need

- A computer running Windows 10+, macOS, or Linux
- An internet connection (only needed for the first setup)
- About 500 MB of free disk space

### Step 1: Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version
3. Run the installer with default settings
4. Restart your computer

To check it worked, open a terminal and run:

```
node --version
```

You should see a version number like `v20.11.0`.

**How to open a terminal:**
- Windows: Press `Win + R`, type `cmd`, press Enter
- macOS: Press `Cmd + Space`, type `Terminal`, press Enter

### Step 2: Download the Project

**Option A: Download as ZIP**

1. Click the green **Code** button on this page, then select **Download ZIP**
2. Extract the ZIP file somewhere on your computer

**Option B: Clone with Git** (if Git is installed)

```
git clone <REPOSITORY_URL>
```

### Step 3: Open a Terminal in the Project Folder

**Windows:**
1. Open File Explorer and go to the project folder
2. Click the address bar at the top
3. Type `cmd` and press Enter

**macOS:**
1. Open Terminal
2. Type `cd ` (with a space after it)
3. Drag the project folder from Finder into the Terminal window
4. Press Enter

To check you are in the right place, run:

```
ls
```

You should see files like `package.json`, `src`, and `README.md`.

### Step 4: Install Dependencies

```
npm install
```

This takes 1 to 3 minutes. Warning messages are normal. Errors show up in red and start with `ERR!`.

### Step 5: Start the Dashboard

```
npm run dev
```

When it is ready, you will see something like:

```
VITE v5.x.x  ready in 500ms
  Local:   http://localhost:8080/
```

Open your browser and go to **http://localhost:8080**.

---

## Daily Usage

| Action | Command |
|---|---|
| Start the dashboard | `npm run dev` |
| Stop the dashboard | `Ctrl + C` in the terminal |
| Restart the dashboard | Stop, then start again |

Your settings are saved in the browser automatically. No internet connection is needed after the first setup. Clearing your browser data will reset saved settings.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Main dashboard components
│   │   ├── DashboardHeader.tsx
│   │   ├── FinancialCharts.tsx
│   │   ├── FormulaExplorer.tsx
│   │   ├── InputSidebar.tsx
│   │   ├── KPICards.tsx
│   │   ├── ReferencesPanel.tsx
│   │   └── ResultsTable.tsx
│   └── ui/                 # Reusable UI components
├── lib/                    # Core logic and configuration
│   ├── constants.ts        # Default inputs, references, bibliography
│   ├── defaultFormulas.ts  # Formula definitions per region
│   ├── formulaEngine.ts    # Math expression evaluator
│   ├── modelLogic.ts       # Calculation functions
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
├── pages/
│   └── Index.tsx           # Main dashboard page
└── test/                   # Test configuration
```

---

## Technology Stack

- **React** + **TypeScript** for the UI
- **Vite** for building and running the app
- **Tailwind CSS** for styling
- **Recharts** for charts
- **mathjs** for formula evaluation
- **shadcn/ui** for UI components

---

## Troubleshooting

**"node is not recognized" or "command not found: node"**
Node.js is not installed or the system PATH was not updated. Reinstall Node.js and restart your computer.

**"npm ERR! code ENOENT"**
Your terminal is not in the right folder. Go back to Step 3 and make sure you are inside the project folder.

**Blank page or error**
Run `npm install` then `npm run dev`. If it still does not work, check the terminal for error messages.

**"Port 8080 is already in use"**
Another app is using that port. Close it, or check the terminal output as the dashboard may have started on a different port.

---

## Quick Reference

```bash
# First time setup (once):
npm install

# Start the dashboard:
npm run dev

# Open in browser:
http://localhost:8080

# Stop the dashboard:
Ctrl + C
```
