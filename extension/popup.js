document.addEventListener('DOMContentLoaded', () => {
  const positionButtons = document.querySelectorAll('.position-btn');
  const scrapePageBtn = document.getElementById('scrape-page');
  const scrapeSiteBtn = document.getElementById('scrape-site');
  const scrapePatternsBtn = document.getElementById('scrape-patterns');
  const positionStatus = document.getElementById('position-status');
  const scrapeStatus = document.getElementById('scrape-status');
  const patternInput = document.getElementById('pattern-input');
  const addPatternBtn = document.getElementById('add-pattern');
  const patternList = document.getElementById('pattern-list');

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

  // Scrape patterns button click handler
  scrapePatternsBtn.addEventListener('click', async () => {
    const { urlPatterns } = await chrome.storage.sync.get(['urlPatterns']);
    if (!urlPatterns || urlPatterns.length === 0) {
      scrapeStatus.textContent = 'Please add URL patterns first';
      scrapeStatus.style.color = '#ef4444';
      setTimeout(() => {
        scrapeStatus.textContent = '';
      }, 3000);
      return;
    }

    // Disable button and show loading state
    scrapePatternsBtn.disabled = true;
    scrapePatternsBtn.innerHTML = `
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Scraping...
    `;

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script with the specific URLs to scrape
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'scrapePatterns',
        urls: urlPatterns
      });

      // Show success message
      scrapeStatus.textContent = 'Started scraping selected URLs...';
      scrapeStatus.style.color = '#22c55e';
    } catch (error) {
      // Show error message
      scrapeStatus.textContent = 'Error: ' + error.message;
      scrapeStatus.style.color = '#ef4444';
    }

    // Reset button state after delay
    setTimeout(() => {
      scrapePatternsBtn.disabled = false;
      scrapePatternsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Scrape Selected URLs
      `;
      scrapeStatus.textContent = '';
    }, 3000);
  });

  // URL Pattern Management
  // Load saved patterns
  async function loadPatterns() {
    const { urlPatterns } = await chrome.storage.sync.get(['urlPatterns']);
    if (urlPatterns) {
      urlPatterns.forEach(pattern => addPatternToList(pattern));
    }
  }

  // Add pattern to UI
  function addPatternToList(pattern) {
    const item = document.createElement('div');
    item.className = 'pattern-item';
    item.innerHTML = `
      <span>${pattern}</span>
      <button class="remove-pattern">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    const removeBtn = item.querySelector('.remove-pattern');
    removeBtn.addEventListener('click', async () => {
      const { urlPatterns } = await chrome.storage.sync.get(['urlPatterns']);
      const updatedPatterns = urlPatterns.filter(p => p !== pattern);
      await chrome.storage.sync.set({ urlPatterns: updatedPatterns });
      item.remove();
    });

    patternList.appendChild(item);
  }

  // Handle adding new pattern
  addPatternBtn.addEventListener('click', async () => {
    const pattern = patternInput.value.trim();
    if (!pattern) return;

    const { urlPatterns = [] } = await chrome.storage.sync.get(['urlPatterns']);
    if (!urlPatterns.includes(pattern)) {
      urlPatterns.push(pattern);
      await chrome.storage.sync.set({ urlPatterns });
      addPatternToList(pattern);
      patternInput.value = '';
    }
  });

  // Load patterns when popup opens
  loadPatterns();
});
