# Eye Care 15-15-15 - Chrome Extension

A cute and funny Chrome extension dedicated to eye well-being, specifically designed to help you follow the **15-15-15 rule**: every 15 minutes, look at an object 15 meters away for 15 seconds.

## 🐼 Features

- **Automated Reminders**: Uses the Chrome Alarms API to notify you every 15 minutes of your work session.
- **Interactive Eye Breaks**: A friendly overlay appears on your active tab, guiding you through a 15-second eye-care ritual.
- **Funny Eye-Care Jokes**: Lighten the mood with a randomized set of cheesy eye-themed puns during every break.
- **Cute Design**: A charming panda-themed interface designed to make eye-care reminders feel welcoming rather than intrusive.
- **Toggle Control**: Easily start or stop the eye-care timer directly from the extension's popup.

## 🛠️ Technology Stack

- **HTML5**: Structured markup for the popup interface.
- **CSS3 (Vanilla)**: Styling with custom animations and a friendly 'panda' aesthetic.
- **JavaScript (Vanilla)**: Core logic for timer synchronization and joke rotation.
- **Chrome APIs**: 
    - `alarms`: For precise 15-minute interval tracking.
    - `storage`: To persist settings and timer state.
    - `notifications`: Optional desktop-level alert support.
    - `contentScripts`: For injecting the overlay and timer onto active web pages.

## 📦 Installation

1.  **Download/Clone** this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (top-right corner).
4.  Click **Load unpacked** and select the `eye-well-being` folder.
5.  Click the puzzle icon (Extensions) and **Pin** "Eye Care 15-15-15" for easy access.

## 📁 Project Structure

```text
eye-well-being/
├── manifest.json       # Extension configuration
├── background.js       # Alarms management and joke loading
├── content.js          # Logic for injecting the break overlay
├── content.css         # Styling for the full-screen break overlay
├── jokes.json          # Collection of funny eye jokes
├── assets/             # Media assets (panda icons, etc.)
└── popup/              # Popup interface folder
    ├── popup.html      # Main interface structure
    ├── popup.css       # Interface styling
    └── popup.js        # UI interaction logic
```

## 📜 License

This project is open-source and free to use.
