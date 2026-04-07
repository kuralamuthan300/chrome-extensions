document.addEventListener('DOMContentLoaded', () => {
  const countdownElement = document.getElementById('countdown');
  const skipBtn = document.getElementById('skip-btn');
  const testBtn = document.getElementById('test-btn');

  // Function to update the countdown timer
  function updateTimer() {
    chrome.runtime.sendMessage({ action: 'GET_NEXT_ALARM' }, (response) => {
      if (response && response.scheduledTime) {
        const remaining = Math.max(0, response.scheduledTime - Date.now());
        const minutes = Math.floor(remaining / 1000 / 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        countdownElement.textContent = "00:00";
      }
    });
  }

  // Initial update and periodic polling (every second)
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

  // Skip / Reset timer action
  skipBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'SKIP_BREAK' }, () => {
      updateTimer();
      alert("Timer reset to 15 minutes! 🐼");
    });
  });

  // Test Break action (trigger overlay immediately on active tab)
  testBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'SHOW_BREAK_OVERLAY' });
      window.close(); // Close popup when test starts
    } else {
      alert("Please switch to a web page to test the break!");
    }
  });

  // Cleanup interval on unload
  window.addEventListener('unload', () => {
    clearInterval(timerInterval);
  });
});
