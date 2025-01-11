document.addEventListener('DOMContentLoaded', function() {
  const positionButtons = document.querySelectorAll('.position-btn');
  const statusElement = document.getElementById('status');

  // Load saved position
  chrome.storage.sync.get(['chatPosition'], function(result) {
    if (result.chatPosition) {
      const activeButton = document.querySelector(`[data-position="${result.chatPosition}"]`);
      if (activeButton) {
        document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
      }
    }
  });

  // Handle position button clicks
  positionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const position = this.dataset.position;

      // Update active button
      positionButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Save position to storage
      chrome.storage.sync.set({ chatPosition: position }, function() {
        // Show status message
        statusElement.textContent = 'Position updated!';
        setTimeout(() => {
          statusElement.textContent = '';
        }, 2000);

        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updatePosition',
            position: position
          });
        });
      });
    });
  });
});
