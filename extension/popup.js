document.addEventListener('DOMContentLoaded', () => {
  const positionButtons = document.querySelectorAll('.position-btn');
  const scrapePageBtn = document.getElementById('scrape-page');
  const scrapeSiteBtn = document.getElementById('scrape-site');
  const positionStatus = document.getElementById('position-status');
  const scrapeStatus = document.getElementById('scrape-status');

  // First remove any existing active classes
  positionButtons.forEach(btn => btn.classList.remove('active'));

  // Load saved position
  chrome.storage.sync.get(['chatPosition'], (result) => {
    const savedPosition = result.chatPosition || 'bottom-left';
    const activeButton = document.querySelector(`[data-position="${savedPosition}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    } else {
      // If no valid position found, default to bottom-left
      const defaultButton = document.querySelector('[data-position="bottom-left"]');
      if (defaultButton) {
        defaultButton.classList.add('active');
        chrome.storage.sync.set({ chatPosition: 'bottom-left' });
      }
    }
  });

  // Position button click handler
  positionButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      positionButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');

      // Save position
      const position = button.dataset.position;
      chrome.storage.sync.set({ chatPosition: position }, () => {
        positionStatus.textContent = 'Position saved';
        setTimeout(() => {
          positionStatus.textContent = '';
        }, 2000);
      });

      // Send message to content script to update position
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updatePosition', 
            position: position 
          });
        }
      });
    });
  });

  // Scrape current page button click handler
  scrapePageBtn.addEventListener('click', async () => {
    if (scrapePageBtn.classList.contains('loading')) return;

    scrapePageBtn.classList.add('loading');
    scrapePageBtn.innerHTML = `
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V6M12 18V21M6 12H3M21 12H18M18.364 18.364L16.243 16.243M7.757 7.757L5.636 5.636M18.364 5.636L16.243 7.757M7.757 16.243L5.636 18.364" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scraping...
    `;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapePage' });
      
      if (response.success) {
        scrapeStatus.textContent = 'Page scraped successfully!';
      } else {
        scrapeStatus.textContent = 'Failed to scrape page';
      }
    } catch (error) {
      scrapeStatus.textContent = 'Error: Could not scrape page';
    }

    scrapePageBtn.classList.remove('loading');
    scrapePageBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10M12 3L4 7V17L12 21L20 17V7L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scrape Current Page
    `;

    setTimeout(() => {
      scrapeStatus.textContent = '';
    }, 3000);
  });

  // Scrape entire site button click handler
  scrapeSiteBtn.addEventListener('click', async () => {
    if (scrapeSiteBtn.classList.contains('loading')) return;

    scrapeSiteBtn.classList.add('loading');
    scrapeSiteBtn.innerHTML = `
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3V6M12 18V21M6 12H3M21 12H18M18.364 18.364L16.243 16.243M7.757 7.757L5.636 5.636M18.364 5.636L16.243 7.757M7.757 16.243L5.636 18.364" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scraping Site...
    `;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrapeSite' });
      
      if (response.success) {
        scrapeStatus.textContent = 'Site scraped successfully!';
      } else {
        scrapeStatus.textContent = 'Failed to scrape site';
      }
    } catch (error) {
      scrapeStatus.textContent = 'Error: Could not scrape site';
    }

    scrapeSiteBtn.classList.remove('loading');
    scrapeSiteBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 7V17L12 21L20 17V7L12 3Z M12 12L20 8M12 12L4 8M12 12V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scrape Entire Site
    `;

    setTimeout(() => {
      scrapeStatus.textContent = '';
    }, 3000);
  });
});
