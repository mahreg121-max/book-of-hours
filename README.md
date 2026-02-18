# 𓂀 Book of Hours

A Kemetic-themed weekly time architecture planner. Built with React + Vite, hosted on GitHub Pages.

![Theme: Ancient Egyptian inspired](https://img.shields.io/badge/theme-kemetic-C49B1A)
![React](https://img.shields.io/badge/react-18-61DAFB)
![Vite](https://img.shields.io/badge/vite-6-646CFF)

## Features

- **Week overview** — color-coded Gantt chart of your entire week
- **Day detail view** — click any day for a full timeline breakdown
- **Editable blocks** — tap any time block to adjust start time, duration, and notes
- **Persistent storage** — changes save to localStorage and survive page refreshes
- **Sleep tracking** — each day shows a sleep score with optimal/adequate/below-target indicators
- **Built-in recommendations** — toggle the 𓁹 Guidance panel for schedule tips
- **Mobile responsive** — works on phone, tablet, and desktop

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/book-of-hours.git
cd book-of-hours

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

Open http://localhost:5173/book-of-hours/ in your browser.

## Deploy to GitHub Pages

### First time setup

1. Create a new repository on GitHub named `book-of-hours`

2. Open `package.json` and replace `USERNAME` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/book-of-hours"
   ```

3. Push your code:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/book-of-hours.git
   git push -u origin main
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Go to your repo on GitHub → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `gh-pages` / `root`
   - Click **Save**

6. Your site will be live at: `https://YOUR_USERNAME.github.io/book-of-hours/`

### Subsequent deploys

After making changes, just run:

```bash
git add .
git commit -m "update schedule"
git push
npm run deploy
```

## Customization

### Adding/removing activities

Edit the `ACTIVITIES` object in `src/App.jsx`:

```js
const ACTIVITIES = {
  my_activity: {
    label: "My Activity",
    color: "#HEX",        // border & bar color
    text: "#HEX",         // text color
    icon: "𓂀",           // any emoji or unicode character
    lightBg: "#HEX",      // background color for blocks
  },
  // ...
};
```

### Changing the schedule

Edit the `DEFAULT_SCHEDULE` object. Each block is:
```js
[startHour, durationHours, "activityKey", "optional note"]
```

Times are in 24h decimal format: `18.5` = 6:30 PM, `6.75` = 6:45 AM.

### Resetting to defaults

Click the **↺ Reset** button in the app, or clear localStorage in your browser.

## Tech Stack

- **React 18** — UI components
- **Vite 6** — build tool
- **GitHub Pages** — hosting (free)
- **localStorage** — persistent data storage

## License

MIT — do whatever you want with it.
