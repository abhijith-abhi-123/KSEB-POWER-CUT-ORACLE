# KSEB Power Cut Oracle v3.2

A satirical, single-page web app mimicking a high-tech power forecast dashboard that unexpectedly "loses power" mid-use. Built with vanilla HTML, CSS, and procedural Web Audio. Now featuring persistent stats, settings, and social sharing!

## 🎯 Features

### Core Features
- **Random Power Cuts**: Unpredictable blackouts between 8-30 seconds (configurable)
- **Fake Predictions**: Humorous oracle verdicts about power availability
- **Realistic Audio**: 
  - Continuous 50Hz electrical mains hum
  - Abrupt circuit trip sound effect
  - Generator restoration chug
  - Crackling ambient noise during blackout
- **Voltage Fluctuations**: Simulated grid voltage changes with warnings
- **Mobile Optimized**: Responsive design with haptic feedback

### ✨ New Features (v3.2)

#### 1. **Persistent Statistics** 📊
- **Survival Streak**: Track continuous time without power cuts
- **Total Predictions**: Count of all predictions made
- **Total Blackouts**: Number of power cuts experienced
- All stats saved to browser localStorage and persist across sessions

#### 2. **Prediction History** 📜
- Last 50 predictions logged with timestamps
- Live-updating history display
- Clear history button in settings
- Quick reference for past verdicts

#### 3. **Settings Modal** ⚙️
- **Volume Control**: Adjust audio from 0-100%
- **Cut Interval**: Set power cut frequency (8-30 seconds)
- **Clear History**: Reset all stats and predictions
- All settings saved to localStorage

#### 4. **Social Sharing** 📤
- Share your survival stats with friends
- Copy stats to clipboard (fallback)
- Native share dialog on supported devices
- Includes prediction count, blackout count, survival time

#### 5. **Enhanced UI**
- Stats display card in header
- Settings button (⚙️) in top-right
- Share button in history section
- Improved modal design (slides up from bottom on mobile)
- Better responsive layout

#### 6. **Better Code Organization**
- **Separated CSS**: `styles.css` external stylesheet
- **Separated JavaScript**: `script.js` with modular architecture
- **Fixed HTML Syntax**: Removed stray `html` tags from original code
- **Well-Commented Code**: Organized into logical sections

## 📁 File Structure

```
KSEB-POWER-CUT-ORACLE/
├── index.html          # Main HTML (cleaned up, links to CSS/JS)
├── styles.css          # All styling (separated from HTML)
├── script.js           # All JavaScript logic (modular)
└── README.md           # This file
```

## 🚀 Quick Start

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Click anywhere to activate the audio
4. Click "🔮 PREDICT AGAIN" to generate predictions
5. Watch as random power cuts strike unexpectedly!

## 🎮 How to Play

- **PREDICT AGAIN**: Generate a new oracle prediction (25% chance it triggers a power cut)
- **⚙️ Settings**: Adjust volume, cut interval, or clear history
- **📤 Share**: Share your survival stats
- **During Blackout**: Click anywhere to restore power
- **Survival Streak**: How long can you last without a power cut?

## 🔧 Customization

Edit `script.js` to customize:

```javascript
// Change prediction interval (in milliseconds)
App.predictions = [
    ["YOUR PREDICTION", "confidence", "color"],
    // ...
];

// Change next cut messages
App.nextCutMessages = [
    "Your custom message",
    // ...
];

// Auto-restore after X seconds (uncomment to enable)
// setInterval(() => {
//     if (this.isPoweredOff) this.restorePower();
// }, 20000);
```

Edit `styles.css` to customize:

```css
:root {
    --green: #39ff88;   /* Primary color */
    --red: #ff5263;     /* Danger color */
    --yellow: #ffe66d;  /* Warning color */
    /* ... other colors */
}
```

## 🔊 Audio Features

- **50Hz Electrical Hum**: Plays continuously when app is active
- **Circuit Trip**: Sharp frequency sweep when power cuts
- **Restoration Chug**: Generator startup sound on power restore
- **Crackling**: Ambient noise during blackout
- **Volume Control**: Adjust all audio from settings modal

## 💾 LocalStorage Schema

Stats stored in `oracleStats`:

```json
{
    "totalPredictions": 42,
    "totalBlackouts": 8,
    "survivalTime": 3725,
    "volume": 50,
    "cutInterval": 15,
    "history": [
        {
            "prediction": "POWER MAY STAY ON",
            "timestamp": "3:45:21 PM"
        }
    ]
}
```

## 📱 Browser Compatibility

- Chrome/Edge 57+
- Firefox 55+
- Safari 14.1+
- Mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile)

## 🎨 Color Scheme

```
Background:    #07110d (Very Dark Green)
Panel:         #0c1c15 (Dark Green)
Lines:         #1d4d36 (Medium Green)
Primary:       #39ff88 (Bright Green)
Warning:       #ffe66d (Yellow)
Danger:        #ff5263 (Red)
Text:          #e8fff1 (Light Green)
```

## 🐛 Bug Fixes in v3.2

- ✅ Fixed stray `html` tags in JavaScript comments
- ✅ Separated CSS and JavaScript for better maintainability
- ✅ Fixed audio initialization timing
- ✅ Improved mobile responsiveness
- ✅ Better error handling in audio operations

## 📝 What's New

| Feature | Before | After |
|---------|--------|-------|
| Persistence | ❌ None | ✅ localStorage |
| Statistics | ❌ None | ✅ Survival, Predictions, Blackouts |
| History | ❌ None | ✅ Last 50 predictions logged |
| Settings | ❌ None | ✅ Volume & interval control |
| Sharing | ❌ None | ✅ Share stats with friends |
| Code Quality | ❌ Mixed | ✅ Separated & organized |
| Mobile UI | ⚠️ Basic | ✅ Settings modal, responsive |

## 🎓 Educational Purpose

This project is created for **college demo purposes** and serves as:
- Example of web audio API usage
- LocalStorage persistence patterns
- Modular JavaScript architecture
- Responsive CSS design
- Git workflow demonstration

## ⚖️ Disclaimer

**NOT AFFILIATED WITH KSEB** (Kerala State Electricity Board)

This is a **satirical entertainment project** for educational purposes only. The predictions are completely unreliable and for amusement. Do not rely on this for actual power cut information!

## 🤝 Contributing

Feel free to fork and enhance! Suggested improvements:
- Real KSEB API integration
- More audio effects
- Leaderboard system
- Dark/Light theme toggle
- Multiple prediction algorithms
- Export stats as CSV

## 📄 License

MIT License - Feel free to use and modify!

---

**Made with ⚡ and humor by abhijith-abhi-123**

*Version 3.2 - September 2026*
