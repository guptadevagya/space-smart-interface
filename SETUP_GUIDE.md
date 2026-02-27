# 🚀 Setup Guide — Run the Model Dashboard on Your Computer

This guide is written for **non-developers**. Follow each step exactly, and you'll have the dashboard running locally in about 10 minutes.

---

## Step 1: Install Node.js

Node.js is a free tool that lets your computer run the dashboard.

1. Go to **[https://nodejs.org](https://nodejs.org)**
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Open the downloaded file and follow the installer — just click **Next → Next → Finish**
4. **Restart your computer** after installing

### ✅ Verify it worked

- **On Windows:** Press `Win + R`, type `cmd`, press Enter
- **On Mac:** Open **Terminal** (search "Terminal" in Spotlight)

Type this and press Enter:

```
node --version
```

You should see something like `v20.x.x`. If you see an error, try restarting your computer.

---

## Step 2: Download the Project

### Option A: Download as ZIP (easiest)

1. Go to the project's GitHub page (your team lead will share the link)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Find the ZIP file in your Downloads folder
5. **Right-click → Extract All** (Windows) or **double-click** (Mac)
6. Remember where you extracted it (e.g., `Downloads/project-folder`)

### Option B: Use Git (if you have it installed)

```
git clone <THE_PROJECT_URL>
```

---

## Step 3: Open the Project Folder in Terminal

### On Windows:

1. Open **File Explorer** and navigate to the extracted project folder
2. Click on the **address bar** at the top (where it shows the folder path)
3. Type `cmd` and press **Enter** — a black terminal window will open in that folder

### On Mac:

1. Open **Terminal**
2. Type `cd ` (with a space after it), then **drag the project folder** from Finder into the Terminal window
3. Press **Enter**

### ✅ Verify you're in the right place

Type this and press Enter:

```
ls
```

You should see files like `package.json`, `src`, `README.md`, etc.

---

## Step 4: Install Dependencies

This downloads all the libraries the dashboard needs. Type this and press Enter:

```
npm install
```

⏳ This may take 1–3 minutes. You'll see a progress bar. Wait until it finishes and you see your cursor blinking again.

> **If you see warnings** — that's normal! Only stop if you see red text saying **"ERR!"**

---

## Step 5: Start the Dashboard

Type this and press Enter:

```
npm run dev
```

You should see something like:

```
  VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:8080/
```

---

## Step 6: Open the Dashboard

1. Open your web browser (Chrome, Edge, Firefox, Safari — any will work)
2. Go to: **[http://localhost:8080](http://localhost:8080)**
3. 🎉 **You should see the dashboard!**

---

## 🔄 How to Use It Day-to-Day

| What you want to do | How to do it |
|---|---|
| **Start the dashboard** | Open terminal in the project folder → type `npm run dev` |
| **Stop the dashboard** | Go to the terminal and press `Ctrl + C` |
| **Restart after changes** | Stop it (`Ctrl + C`), then run `npm run dev` again |

---

## 💾 Your Data is Saved Locally

All your changes (custom parameters, formulas, configurations) are saved in your **browser's local storage**. This means:

- ✅ Your settings persist between sessions
- ✅ No internet connection needed after setup
- ⚠️ Clearing browser data will reset your settings
- ⚠️ Different browsers will have separate settings

---

## ❓ Troubleshooting

### "node is not recognized" or "command not found"
→ Node.js isn't installed properly. Go back to **Step 1** and restart your computer after installing.

### "npm ERR! code ENOENT"
→ You're not in the right folder. Make sure your terminal is inside the project folder (see **Step 3**).

### The page is blank or shows an error
→ Check the terminal window — if it shows red errors, try:
```
npm install
npm run dev
```

### Port 8080 is already in use
→ Another program is using that port. Either close it, or the dashboard will automatically try another port (check the terminal output for the URL).

### Nothing works and I'm stuck
→ Send a screenshot of your terminal to your technical contact. The error messages will help them diagnose the issue quickly.

---

## 📋 Quick Reference (Cheat Sheet)

```
# One-time setup:
1. Install Node.js from https://nodejs.org
2. Open terminal in project folder
3. npm install

# Every time you want to use it:
1. Open terminal in project folder
2. npm run dev
3. Open http://localhost:8080 in your browser
4. Press Ctrl+C in terminal when done
```
