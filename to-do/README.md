# Fluent Tasks - Chrome Extension

A professional, spacious, and feature-rich To-Do List extension for Google Chrome, styled with Microsoft's Fluent UI design system.

## 🚀 Features

- **Multiple Custom Lists**: Create and manage separate lists for different areas of your life (e.g., Work, Personal, Groceries).
- **Comprehensive Task Details**:
    - **Subtasks**: Break down complex tasks into smaller, manageable steps with progress tracking.
    - **Deadlines**: Set due dates and times for your tasks.
    - **Linked URLs**: Save related websites directly to your tasks for quick access.
- **Fluent UI Design**: A clean, professional, and spacious interface following Microsoft's design principles.
- **Dark & Light Mode**: Seamlessly toggle between light and dark themes based on your preference.
- **Quick Add Current Tab**: Instantly create a task from your active browser tab, capturing its title and URL with one click.
- **Smart Notifications**: Receive browser notifications 1 hour before a task's deadline.
- **Drag-and-Drop Reordering**: Easily prioritize your tasks by dragging them into your preferred order.
- **Local Storage Sync**: Your data is saved locally and remains persistent across browser sessions.

## 🛠️ Technology Stack

- **HTML5**: Semantic structure.
- **CSS3 (Vanilla)**: Custom styling using CSS variables and Fluent UI design tokens.
- **JavaScript (Vanilla)**: Core application logic, state management, and Chrome API integration.
- **Chrome APIs**: `storage`, `alarms`, `notifications`, `activeTab`.

## 📦 Installation

To run this extension locally in your Chrome browser:

1.  **Download/Clone** this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** using the toggle switch in the top-right corner.
4.  Click the **Load unpacked** button in the top-left.
5.  Select the project folder (the directory containing `manifest.json`).
6.  (Optional) Click the puzzle icon (Extensions) in your browser toolbar and **Pin** "Fluent Tasks" for easy access.

## 📁 Project Structure

```text
todo-extension/
├── manifest.json         # Extension configuration
├── index.html            # Main popup interface
├── styles.css            # Fluent UI styling
├── popup.js              # Application logic
├── background.js         # Background service worker for alarms/notifications
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # Project documentation
```

## 📝 License

This project is open-source and free to use.
