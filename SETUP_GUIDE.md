# Local Setup Guide

This guide walks you through running the OxNNet Health Economics Dashboard on your own computer. No prior coding experience is required.

---

## Prerequisites

- A computer running Windows 10+, macOS, or Linux
- An internet connection (for initial setup only)
- Approximately 500 MB of free disk space

---

## Step 1 — Install Node.js

Node.js is the runtime environment required to run the dashboard.

1. Visit [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** (Long Term Support) version
3. Run the installer using the default settings
4. Restart your computer after installation

To confirm the installation was successful, open a terminal and run:

```
node --version
```

You should see a version number (e.g. `v20.11.0`). If you see an error, revisit the installation step above.

**How to open a terminal:**
- Windows: Press `Win + R`, type `cmd`, press Enter
- macOS: Open Spotlight (`Cmd + Space`), type `Terminal`, press Enter

---

## Step 2 — Download the Project

**Option A — Download as ZIP**

1. Navigate to the project's GitHub repository
2. Click the green **Code** button, then select **Download ZIP**
3. Extract the ZIP file to a location of your choice

**Option B — Clone with Git** (if Git is installed)

```
git clone <REPOSITORY_URL>
```

---

## Step 3 — Open a Terminal in the Project Folder

You need to navigate your terminal to the project directory before running any commands.

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

---

## Step 4 — Install Dependencies

Run the following command to install all required packages:

```
npm install
```

This process takes 1–3 minutes. Wait until the command completes before proceeding. Warning messages during installation are normal and can be ignored. Errors will appear in red and begin with `ERR!`.

---

## Step 5 — Start the Dashboard

Run:

```
npm run dev
```

Once the server is ready, you will see output similar to:

```
VITE v5.x.x  ready in 500ms
  Local:   http://localhost:8080/
```

Open your web browser and navigate to **http://localhost:8080**. The dashboard should now be visible.

---

## Daily Usage

| Action | Command |
|---|---|
| Start the dashboard | `npm run dev` |
| Stop the dashboard | `Ctrl + C` in the terminal |
| Restart the dashboard | Stop, then start again |

All configuration changes (parameters, formulas, settings) are saved automatically in your browser's local storage. No internet connection is needed after the initial setup. Note that clearing your browser data will reset saved configurations.

---

## Troubleshooting

**"node is not recognized" / "command not found: node"**

Node.js is not installed or the system PATH was not updated. Reinstall Node.js and restart your computer.

**"npm ERR! code ENOENT"**

The terminal is not in the correct directory. Repeat Step 3 to ensure you are inside the project folder.

**Blank page or application error**

Run the following commands in sequence:

```
npm install
npm run dev
```

If the issue persists, check the terminal output for specific error messages.

**"Port 8080 is already in use"**

Another application is occupying port 8080. Close it, or check the terminal output — the dashboard may have started on an alternative port.

**Unresolved issues**

Capture a screenshot of the terminal output showing the error and send it to your technical contact for further assistance.

---

## Quick Reference

```
# First-time setup (once):
npm install

# Start the dashboard:
npm run dev

# Open in browser:
http://localhost:8080

# Stop the dashboard:
Ctrl + C
```
