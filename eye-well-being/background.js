// Alarm name for the break periodic reminder
const BREAK_ALARM = 'eye-break-alarm';

// Initialize alarm on install/extension startup
chrome.runtime.onInstalled.addListener(() => {
  createAlarm();
  console.log('Eye Care 15-15-15: Extension installed and alarm set.');
});

// Alarm firing handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === BREAK_ALARM) {
    triggerBreakOverlay();
  }
});

// Function to create the 15-minute alarm
function createAlarm() {
  chrome.alarms.create(BREAK_ALARM, {
    periodInMinutes: 15
  });
}

// Function to notify the active tab to show the break overlay
async function triggerBreakOverlay() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'SHOW_BREAK_OVERLAY' });
  }
  
  // Show a basic notification for system-level awareness
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/panda.png',
    title: "15-15-15 Rule",
    message: "Time for a 15-second break. Look 15 meters away!",
    priority: 2
  });
}

// Handle messages from the popup (e.g. settings or manual trigger)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_NEXT_ALARM') {
    chrome.alarms.get(BREAK_ALARM, (alarm) => {
      sendResponse({ scheduledTime: alarm?.scheduledTime });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'SKIP_BREAK') {
    createAlarm();
  }
});
