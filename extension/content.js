// Create the HTML content
const chatbotHTML = `
  <div class="chat-bubble" id="chat-bubble">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="chat-container hidden" id="chat-container">
    <div class="chat-header">
      <div class="header-content">
        <div class="header-title">
          <h2>Chat Assistant</h2>
          <span class="status-indicator">Online</span>
        </div>
        <div class="header-actions">
          <button id="scrape-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Scrape Site
          </button>
          <button id="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="message bot-message">
        Hello! How can I help you today?
      </div>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message..." id="message-input">
      <button id="send-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
`;

// Create and inject styles
const style = document.createElement('style');
style.textContent = `
  .chat-bubble {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #2563eb;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    transition: all 0.2s ease;
    z-index: 10000;
  }

  /* Position classes */
  .chat-bubble.top-left { top: 20px; left: 20px; bottom: auto; right: auto; }
  .chat-bubble.top-center { top: 20px; left: 50%; bottom: auto; right: auto; transform: translateX(-50%); }
  .chat-bubble.top-right { top: 20px; right: 20px; bottom: auto; left: auto; }
  .chat-bubble.middle-left { top: 50%; left: 20px; bottom: auto; right: auto; transform: translateY(-50%); }
  .chat-bubble.middle-center { top: 50%; left: 50%; bottom: auto; right: auto; transform: translate(-50%, -50%); }
  .chat-bubble.middle-right { top: 50%; right: 20px; bottom: auto; left: auto; transform: translateY(-50%); }
  .chat-bubble.bottom-left { bottom: 20px; left: 20px; top: auto; right: auto; }
  .chat-bubble.bottom-center { bottom: 20px; left: 50%; top: auto; right: auto; transform: translateX(-50%); }
  .chat-bubble.bottom-right { bottom: 20px; right: 20px; top: auto; left: auto; }

  .chat-bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  }

  /* Maintain hover transform with position transforms */
  .chat-bubble.top-center:hover { transform: translateX(-50%) scale(1.05); }
  .chat-bubble.middle-left:hover { transform: translateY(-50%) scale(1.05); }
  .chat-bubble.middle-center:hover { transform: translate(-50%, -50%) scale(1.05); }
  .chat-bubble.middle-right:hover { transform: translateY(-50%) scale(1.05); }
  .chat-bubble.bottom-center:hover { transform: translateX(-50%) scale(1.05); }

  .chat-container {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 380px;
    height: 600px;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10000;
    opacity: 1;
    transform-origin: bottom right;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .chat-container.hidden {
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
  }

  .chat-header {
    background: #2563eb;
    color: white;
    padding: 16px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-title h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .status-indicator {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  #scrape-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s ease;
  }

  #scrape-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  #scrape-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  #close-btn {
    background: none;
    border: none;
    color: white;
    padding: 4px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
  }

  #close-btn:hover {
    opacity: 1;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f8fafc;
  }

  .message {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.5;
    animation: messageAppear 0.3s ease;
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .bot-message {
    background: white;
    border: 1px solid #e2e8f0;
    align-self: flex-start;
    color: #1e293b;
  }

  .user-message {
    background: #2563eb;
    color: white;
    align-self: flex-end;
  }

  .chat-input {
    padding: 16px;
    background: white;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 8px;
  }

  #message-input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s ease;
    outline: none;
    color: #1e293b;
    background: white;
  }

  #message-input::placeholder {
    color: #94a3b8;
  }

  #message-input:focus {
    border-color: #2563eb;
  }

  #send-btn {
    background: #2563eb;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  #send-btn:hover {
    background: #1d4ed8;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    align-self: flex-start;
    width: fit-content;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    background: #94a3b8;
    border-radius: 50%;
    animation: typingAnimation 1.4s infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typingAnimation {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
`;

// Create container and inject HTML
const container = document.createElement('div');
container.innerHTML = chatbotHTML;

// Inject styles and container
document.head.appendChild(style);
document.body.appendChild(container);

// Add event listeners
const chatBubble = container.querySelector('#chat-bubble');
const chatContainer = container.querySelector('#chat-container');
const closeBtn = container.querySelector('#close-btn');
const messageInput = container.querySelector('#message-input');
const sendButton = container.querySelector('#send-btn');
const messagesContainer = container.querySelector('.chat-messages');
const scrapeButton = container.querySelector('#scrape-btn');

function addMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageDiv.textContent = text;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return typingDiv;
}

// Load chat history when chat is opened
async function loadChatHistory() {
  try {
    const domain = getCurrentDomain();
    const response = await callAPI(`chat-history/${domain}`, null, 'GET');
    const data = await response.json();

    if (data.success && data.messages) {
      // Clear existing messages
      messagesContainer.innerHTML = '';

      // Add each message from history
      data.messages.forEach(msg => {
        addMessage(msg.content, msg.role === 'user');
      });

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

// Call API with retry logic
async function callAPI(endpoint, data, method) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 API Call (Attempt ${attempt}/${maxRetries}):`, {
        endpoint,
        method,
        dataSize: data ? JSON.stringify(data).length : 0
      });

      const response = await fetch(`http://localhost:8080/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`API request failed: ${response.status}\n${errorText}`);
      }

      return response;
    } catch (error) {
      console.error(`❌ API Error (Attempt ${attempt}/${maxRetries}):`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Handle chat functionality
async function sendMessageToAI(message) {
  try {
    const domain = getCurrentDomain();
    console.log('📝 YURURRR:', message);

    const response = await callAPI('', {
      messages: [
        { role: 'user', content: message }
      ],
      domain,
    },
    'POST'
  );

    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiResponse = '';

    // Add typing indicator first
    const typingIndicator = addTypingIndicator();
    let messageDiv = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      aiResponse += chunk;

      // Create or update the message div
      if (!messageDiv) {
        // Remove typing indicator before adding the message
        typingIndicator.remove();
        // Create new message div
        messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messagesContainer.appendChild(messageDiv);
      }

      // Update the message content
      messageDiv.textContent = aiResponse;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

  } catch (error) {
    console.error('Error sending message to AI:', error);
    addMessage('Sorry, there was an error processing your message. Please try again.', false);
  }
}

sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  if (message) {
    // Show user message
    addMessage(message, true);
    messageInput.value = '';

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    try {
      console.log('📝 Sending message to AI:', message);
      await sendMessageToAI(message);
    } finally {
      // Remove typing indicator if it still exists
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }
    }
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendButton.click();
  }
});

// Sitemap and scraping functions
async function handleScraping(fullSite = false, specificUrls = null) {
  try {
    console.log('🚀 Starting scraping process:', { fullSite, hasSpecificUrls: !!specificUrls });

    // Show scraping status
    const scrapeBtn = document.querySelector('#scrape-btn');
    if (scrapeBtn) {
      scrapeBtn.disabled = true;
      scrapeBtn.innerHTML = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Scraping...
      `;
    }

    let results = [];
    if (specificUrls) {
      console.log('🎯 Scraping specific URLs:', specificUrls);
      results = await scrapeSpecificUrls(specificUrls);
    } else if (fullSite) {
      console.log('🌐 Crawling entire site');
      const { urlPatterns } = await chrome.storage.sync.get(['urlPatterns']);
      const patterns = urlPatterns || ['*'];
      results = await crawlSite(patterns);
    } else {
      console.log('📄 Scraping current page only');
      const content = {
        url: window.location.href,
        domain: window.location.hostname,
        content: `Title: ${document.title}\nDescription: ${document.querySelector('meta[name="description"]')?.content || ''}\n\nContent:\n${getPageContent()}`
      };
      results = [content];
    }

    console.log(`📊 Processing ${results.length} results`);

    // Send results to backend
    for (const result of results) {
      console.log(`🔄 Processing result for ${result.url}`);
      const chunks = chunkContent(result);
      console.log(`📦 Created ${chunks.length} chunks for ${result.url}`);

      for (const chunk of chunks) {
        console.log(`📤 Sending chunk to server, size: ${chunk.content.length}`);
        const response = await callAPI('store', { documents: [chunk] },
          'POST'
        );
        if (!response.ok) {
          console.error(`Failed to store chunk for ${result.url}`);
          continue;
        }
        const responseData = await response.json();
        console.log(`📥 Server response:`, responseData);
      }
    }

    // Update button state
    if (scrapeBtn) {
      scrapeBtn.disabled = false;
      scrapeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Scrape Site
      `;
    }

    // Show success message
    addMessage('✅ Successfully scraped and stored content!', false);
  } catch (error) {
    console.error('❌ Scraping error:', error);
    addMessage('❌ Error while scraping: ' + error.message, false);
  }
}

// Handle scraping specific URLs
async function scrapeSpecificUrls(urls) {
  const results = [];

  for (const url of urls) {
    try {
      console.log(`🔍 Scraping: ${url}`);
      const response = await fetch(url);
      const html = await response.text();
      console.log(`📄 Got HTML content for ${url}, length: ${html.length}`);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      console.log(`🔄 Parsed HTML for ${url}`);

      const content = {
        url,
        domain: new URL(url).hostname,
        content: `Title: ${doc.title}\nDescription: ${doc.querySelector('meta[name="description"]')?.content || ''}\n\nContent:\n${getPageContent(doc.body)}`
      };

      console.log(`📦 Created content object for ${url}:`, {
        url: content.url,
        domain: content.domain,
        contentLength: content.content.length
      });

      // Store the content immediately after scraping
      const storeResponse = await callAPI('store', { documents: [content] }, 'POST');
      if (!storeResponse.ok) {
        console.error(`Failed to store content for ${url}`);
      }

      results.push(content);

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      addMessage(`❌ Error scraping ${url}: ${error.message}`, false);
      return
    }
  }

  console.log(`✅ Finished scraping ${results.length} URLs`);
  return results;
}

// Crawl site with URL pattern matching
async function crawlSite(urlPatterns = ['*']) {
  const baseUrl = window.location.origin;
  const visited = new Set();
  const queue = [window.location.href];
  const results = [];

  while (queue.length > 0 && visited.size < 100) { // Limit to 100 pages
    const url = queue.shift();
    if (visited.has(url)) continue;

    visited.add(url);
    console.log(`🔍 Scraping: ${url}`);

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check if URL matches any pattern
      const shouldScrape = urlPatterns.some(pattern => {
        // Convert glob pattern to regex
        const regex = new RegExp('^' + pattern.split('*').map(s => escapeRegExp(s)).join('.*') + '$');
        return regex.test(url);
      });

      if (shouldScrape) {
        // Store the page content
        results.push({
          url,
          domain: new URL(url).hostname,
          content: `Title: ${doc.title}\nDescription: ${doc.querySelector('meta[name="description"]')?.content || ''}\n\nContent:\n${getPageContent(doc.body)}`
        });
      }

      // Find all links on the page
      const links = Array.from(doc.querySelectorAll('a[href]'))
        .map(a => {
          try {
            return new URL(a.href, baseUrl).href;
          } catch {
            return null;
          }
        })
        .filter(href =>
          href &&
          href.startsWith(baseUrl) && // Only include links from same domain
          !href.includes('#') && // Exclude anchor links
          !visited.has(href) && // Exclude already visited
          !href.match(/\.(jpg|jpeg|png|gif|pdf|zip|doc|docx|xls|xlsx)$/i) // Exclude non-HTML resources
        );

      // Add new links to the queue
      queue.push(...links);

      // Update progress
      console.log(`📊 Progress: ${visited.size} pages processed, ${queue.length} in queue`);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }

    // Add a small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// Helper function to get clean page content
function getPageContent(element = document.body) {
  // Create a clone to manipulate
  const clone = element.cloneNode(true);

  // Remove unwanted elements
  const elementsToRemove = clone.querySelectorAll('script, style, noscript, iframe, svg');
  elementsToRemove.forEach(el => el.remove());

  // Get text content and clean it
  return clone.textContent
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

// Get current domain
function getCurrentDomain() {
  return window.location.hostname;
}

// Store scraped content in vector database
async function storeScrapedContent(pages) {
  try {
    const domain = getCurrentDomain();
    const documents = pages.map(page => ({
      url: page.url,
      content: page.content,
      domain: domain,
      metadata: {
        title: page.title
      }
    }));

    const response = await callAPI('store', { documents }, "POST");

    if (!response.ok) {
      throw new Error('Failed to store content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error storing content:', error);
    throw error;
  }
}

// Example of searching stored content
async function searchContent(query) {
  try {
    const results = await callAPI('search', { query }, "POST");
    console.log('🔍 Search results:', results);
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

scrapeButton.addEventListener('click', async () => {
  const button = scrapeButton;
  button.textContent = 'Scraping...';
  button.disabled = true;

  try {
    await handleScraping(true);
    button.textContent = 'Scrape Site';
    button.disabled = false;
    addMessage(`Scraped site successfully! The content is now available for our conversation.`, false);
  } catch (error) {
    console.error('Failed to scrape site:', error);
    button.textContent = 'Scrape Site';
    button.disabled = false;
    addMessage('Sorry, there was an error scraping the site.', false);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updatePosition') {
    updateBubblePosition(request.position);
    sendResponse({ success: true });
  } else if (request.action === 'scrapePage') {
    handleScraping(false);
    sendResponse({ success: true });
  } else if (request.action === 'scrapeSite') {
    handleScraping(true);
    sendResponse({ success: true });
  } else if (request.action === 'scrapePatterns') {
    handleScraping(false, request.urls);
    sendResponse({ success: true });
  }
  return true;
});

// Load saved position
chrome.storage.sync.get(['chatPosition'], function(result) {
  if (result.chatPosition) {
    updateBubblePosition(result.chatPosition);
  }
});

// Listen for position update messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updatePosition') {
    updateBubblePosition(request.position);
  }
});

function updateBubblePosition(position) {
  const bubble = document.querySelector('.chat-bubble');
  if (bubble) {
    // Remove all position classes
    bubble.classList.remove(
      'top-left', 'top-center', 'top-right',
      'middle-left', 'middle-center', 'middle-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    );
    // Add new position class
    bubble.classList.add(position);
  }
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to chunk content into smaller pieces
function chunkContent(pageData) {
  const maxChunkSize = 8000; // Maximum size of each chunk
  const content = pageData.content;
  const chunks = [];

  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());
  let currentChunk = [];
  let currentSize = 0;

  for (const paragraph of paragraphs) {
    if (currentSize + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      // Create a new chunk from accumulated paragraphs
      chunks.push({
        url: pageData.url,
        domain: pageData.domain,
        content: currentChunk.join('\n')
      });
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(paragraph);
    currentSize += paragraph.length;
  }

  // Add the last chunk if there's anything left
  if (currentChunk.length > 0) {
    chunks.push({
      url: pageData.url,
      domain: pageData.domain,
      content: currentChunk.join('\n')
    });
  }

  return chunks;
}

// Toggle chat container visibility
chatBubble.addEventListener('click', () => {
  chatContainer.classList.remove('hidden');
  messageInput.focus();
  loadChatHistory(); // Load chat history when opening chat
});

closeBtn.addEventListener('click', () => {
  chatContainer.classList.add('hidden');
});
