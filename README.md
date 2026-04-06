# OxNNet Health Economics Dashboard

An interactive simulation tool that models the clinical and economic impact of deploying OxNNet AI screening for Fetal Growth Restriction (FGR) across the US, UK, and global maternity care markets.

## The Problem

Fetal Growth Restriction affects roughly 8% of pregnancies and is a leading cause of stillbirth, neonatal brain injury, and cerebral palsy. Current screening methods (fundal height measurement) detect only about 33% of cases. OxNNet, an AI model developed at Oxford, analyzes first-trimester placental ultrasound images and detects approximately 66% of FGR cases -- doubling the detection rate.

## What This Tool Does

This dashboard quantifies what that detection gap means in practice:

- **Clinical outcomes**: How many emergency C-sections, NICU admissions, hypoxic brain injuries, cerebral palsy cases, and stillbirths could be avoided
- **Financial impact**: Cost savings from avoided procedures, litigation avoidance, and (in the US) scan reimbursement revenue
- **Provider-level analysis**: Drill down into 54 named US healthcare providers (19 IPPs, 35 IDNs) to see projected impact per system
- **Geographic view**: Interactive US state heatmap showing provider distribution and market concentration
- **Transparency**: Every input parameter is editable and cited to peer-reviewed literature. All formulas are visible and adjustable.

Three market models are supported:

- **US** (3.6M births/year) -- Revenue + cost avoidance perspective, with provider drill-down
- **UK** (600K births/year) -- NHS net savings perspective
- **Global** (13.6M births/year) -- Preliminary estimates using UK model assumptions

---

## Getting Started

No coding experience required. You just need to install one thing, then run two commands.

### 1. Install Node.js

Go to [https://nodejs.org](https://nodejs.org) and download the **LTS** version. Run the installer with default settings, then restart your computer.

To verify it installed, open a terminal and type:

```
node --version
```

You should see a version number (e.g. `v22.x.x`).

**How to open a terminal:**

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter

### 2. Download This Project

Click the green **Code** button on this GitHub page, then **Download ZIP**. Extract the ZIP to a folder on your computer.

Or if you have Git installed:

```
git clone <REPOSITORY_URL>
```

### 3. Open a Terminal in the Project Folder

**Windows:** Open File Explorer, navigate to the project folder, click the address bar, type `cmd`, press Enter.

**Mac:** Open Terminal, type `cd ` (with a space), then drag the project folder from Finder into the terminal and press Enter.

### 4. Install and Run

```
npm install
npm run dev
```

The first command downloads dependencies (takes 1-3 minutes, only needed once). The second starts the dashboard. When you see output like this:

```
VITE v8.x.x  ready in 500ms
  Local:   http://localhost:8080/
```

Open **http://localhost:8080** in your browser. That's it.

---

## Daily Use

| Action              | What to do                                       |
| ------------------- | ------------------------------------------------ |
| Start the dashboard | Open a terminal in the folder, run `npm run dev` |
| Stop the dashboard  | Press `Ctrl + C` in the terminal                 |
| Switch regions      | Use the US / UK / Global tabs at the top         |
| Save a scenario     | Click the save icon in the header                |
| Print a report      | Click the print icon in the header               |

Your configurations save automatically in the browser. No internet needed after initial setup. Clearing browser data will reset saved scenarios.

---

## Troubleshooting

**"node is not recognized" or "command not found: node"**
Node.js isn't installed or needs a restart. Reinstall from [nodejs.org](https://nodejs.org) and restart your computer.

**"npm ERR! code ENOENT"**
Your terminal isn't in the project folder. Make sure you see files like `package.json` when you run `ls` (Mac) or `dir` (Windows).

**Blank page or errors in the browser**
Run `npm install` again, then `npm run dev`. Check the terminal for red error messages.

**"Port 8080 is already in use"**
Close whatever else is using that port, or check the terminal -- Vite may have automatically picked a different port.
