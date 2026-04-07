// Injected script to handle the break UI
let overlayVisible = false;

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SHOW_BREAK_OVERLAY') {
    showOverlay();
  }
});

async function showOverlay() {
  if (overlayVisible) return;
  overlayVisible = true;

  // Create overlay container
  const container = document.createElement('div');
  container.id = 'eye-care-overlay';
  
  // Get a random joke
  const jokes = [
    "What do you call a fish with no eyes? A fsh!",
    "Why did the eye cross the road? Because it was feeling a bit near-sighted!",
    "What did one eye say to the other? Between you and me, something smells!",
    "Are you an eye doctor? Because you're looking good today!",
    "Why don't eyes ever get lost? Because they always keep looking!",
    "Why was the cyclops always alone? Because he couldn't see eye to eye with anyone!",
    "What's an eye's favorite dessert? An eye-scream sandwich!",
    "You're lookin' sharp today! Eye care what you think!",
    "Why did the teacher wear sunglasses? Because the students were so bright!"
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  const pandaUrl = chrome.runtime.getURL('assets/panda.png');

  container.innerHTML = `
    <div class="eye-care-content">
      <img src="${pandaUrl}" class="panda-mascot" alt="Panda Mascot">
      <h1>Time for a 15s Break!</h1>
      <p class="instruction">Look at something <strong>15 meters</strong> away.</p>
      <div class="countdown" id="eye-care-timer">15</div>
      <div class="joke-container">
        <p class="joke-title">Here's a joke for you:</p>
        <p class="joke-text">"${joke}"</p>
      </div>
      <button id="eye-care-close">I'm back!</button>
    </div>
  `;

  document.body.appendChild(container);

  // Play a gentle "ping" sound
  playPing();

  // Timer logic
  let timeLeft = 15;
  const timerElement = container.querySelector('#eye-care-timer');
  const closeButton = container.querySelector('#eye-care-close');

  const interval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      timerElement.textContent = "Done!";
      timerElement.classList.add('done');
    }
  }, 1000);

  closeButton.addEventListener('click', () => {
    clearInterval(interval);
    removeOverlay();
  });

  // Auto-remove after 20 seconds even if not clicked (buffer)
  setTimeout(() => {
    removeOverlay();
  }, 20000);
}

function removeOverlay() {
  const overlay = document.getElementById('eye-care-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
      overlayVisible = false;
    }, 500);
  }
}
