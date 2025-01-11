document.addEventListener('DOMContentLoaded', function() {
  const positionButtons = document.querySelectorAll('.position-btn');
  const positionStatus = document.getElementById('position-status');
  const scrapeStatus = document.getElementById('scrape-status');
  const scrapePageBtn = document.getElementById('scrape-page');
  const scrapeSiteBtn = document.getElementById('scrape-site');

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
        positionStatus.textContent = 'Position updated!';
        setTimeout(() => {
          positionStatus.textContent = '';
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

  // Handle scrape page button
  scrapePageBtn.addEventListener('click', async function() {
    const button = this;
    button.classList.add('loading');
    button.disabled = true;
    scrapeStatus.textContent = 'Scraping current page...';

    try {
      // Send message to content script to scrape current page
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapePage',
        fullSite: false
      });

      scrapeStatus.textContent = 'Page scraped successfully!';
    } catch (error) {
      scrapeStatus.textContent = 'Error scraping page';
      console.error('Scraping error:', error);
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
      setTimeout(() => {
        scrapeStatus.textContent = '';
      }, 2000);
    }
  });

  // Handle scrape site button
  scrapeSiteBtn.addEventListener('click', async function() {
    const button = this;
    button.classList.add('loading');
    button.disabled = true;
    scrapeStatus.textContent = 'Scraping entire site...';

    try {
      // Send message to content script to scrape entire site
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapePage',
        fullSite: true
      });

      scrapeStatus.textContent = 'Site scraped successfully!';
    } catch (error) {
      scrapeStatus.textContent = 'Error scraping site';
      console.error('Scraping error:', error);
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
      setTimeout(() => {
        scrapeStatus.textContent = '';
      }, 2000);
    }
  });
});
