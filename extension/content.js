// Create the HTML content
const chatbotHTML = `
  <div class="chat-bubble" id="chat-bubble">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
    </svg>
  </div>
  <div class="chat-container hidden" id="chat-container">
    <div class="chat-header">
      <h2>Mike's Chat Assistant</h2>
      <button id="scrape-btn" style="
        background: none;
        border: 1px solid #F5F5F0;
        color: #F5F5F0;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        margin-right: 8px;
      ">Scrape Site</button>
      <button id="close-btn">×</button>
    </div>
    <div class="chat-messages">
      <div class="message bot-message">
        Hello! How can I help you today?
      </div>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message..." id="message-input">
      <button id="send-btn">Send</button>
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
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #2C2C2C;
    color: #F5F5F0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
    z-index: 10000;
  }

  .chat-bubble:hover {
    transform: scale(1.1);
    background: #1A1A1A;
  }

  .chat-container {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 400px;
    height: 600px;
    border-radius: 12px;
    background: #F5F5F0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10000;
    opacity: 1;
    transform-origin: bottom right;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .chat-container.hidden {
    opacity: 0;
    transform: scale(0.7);
    pointer-events: none;
  }

  .chat-header {
    background: #2C2C2C;
    color: #F5F5F0;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #F5F5F0;
  }

  #close-btn {
    background: none;
    border: none;
    color: #F5F5F0;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #F5F5F0;
  }

  .message {
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    max-width: 80%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .bot-message {
    background: #E8E8E3;
    color: #2C2C2C;
    margin-right: auto;
  }

  .user-message {
    background: #2C2C2C;
    color: #F5F5F0;
    margin-left: auto;
  }

  .chat-input {
    padding: 1rem;
    border-top: 1px solid #E8E8E3;
    display: flex;
    gap: 0.5rem;
    background: #F5F5F0;
  }

  .chat-input input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #E8E8E3;
    border-radius: 0.375rem;
    outline: none;
    background: #FFFFFF;
    color: #2C2C2C;
    font-size: 0.95rem;
  }

  .chat-input input:focus {
    border-color: #2C2C2C;
  }

  .chat-input button {
    background: #2C2C2C;
    color: #F5F5F0;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease;
  }

  .chat-input button:hover {
    background: #1A1A1A;
  }

  .typing-indicator {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #E8E8E3;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    width: fit-content;
  }

  .typing-dot {
    width: 8px;
    height: 8px;
    background: #2C2C2C;
    border-radius: 50%;
    opacity: 0.4;
    animation: typing-dot 1.4s infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing-dot {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
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

// Toggle chat container visibility
chatBubble.addEventListener('click', () => {
  chatContainer.classList.remove('hidden');
  messageInput.focus();
});

closeBtn.addEventListener('click', () => {
  chatContainer.classList.add('hidden');
});

// Handle chat functionality
async function sendMessageToAI(message) {
  try {
    const domain = getCurrentDomain();
    const response = await callAPI('/', {
      messages: [
        { role: 'user', content: message }
      ],
      currentDomain: domain
    });

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
async function getSitemapUrls() {
  const currentUrl = new URL(window.location.href);
  const baseUrl = currentUrl.origin;
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  console.log('🔍 Attempting to fetch sitemap from:', sitemapUrl);

  try {
    // Try sitemap.xml first
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      // If sitemap.xml fails, try robots.txt
      console.log('⚠️ No sitemap.xml found, checking robots.txt...');
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      if (!robotsResponse.ok) {
        throw new Error('No robots.txt found');
      }

      const robotsText = await robotsResponse.text();
      const sitemapMatch = robotsText.match(/Sitemap: (.*)/i);
      if (!sitemapMatch) {
        throw new Error('No sitemap URL found in robots.txt');
      }

      const alternateSitemapUrl = sitemapMatch[1];
      console.log('📍 Found sitemap URL in robots.txt:', alternateSitemapUrl);
      const sitemapResponse = await fetch(alternateSitemapUrl);
      if (!sitemapResponse.ok) {
        throw new Error('Failed to fetch sitemap from robots.txt URL');
      }
      return await parseSitemapXml(await sitemapResponse.text());
    }

    return await parseSitemapXml(await response.text());
  } catch (error) {
    console.log('⚠️ Failed to fetch sitemap, falling back to page crawling...');
    return await crawlPageLinks();
  }
}

function parseSitemapXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent);
  console.log(`📋 Found ${urls.length} URLs in sitemap`);
  return urls;
}

async function crawlPageLinks() {
  console.log('🕷️ Crawling page links...');
  const baseUrl = window.location.origin;
  const links = Array.from(document.getElementsByTagName('a'))
    .map(a => a.href)
    .filter(href => href.startsWith(baseUrl))
    .filter((href, index, self) => self.indexOf(href) === index); // Remove duplicates

  console.log(`🔗 Found ${links.length} unique internal links`);
  return links;
}

// Example API call function
async function callAPI(endpoint, data) {
  try {
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function scrapeAllPages() {
  const urls = await getSitemapUrls();
  const scrapedContent = [];
  let completed = 0;

  console.log(`🚀 Starting to scrape ${urls.length} pages...`);

  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(async (url) => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const content = {
          url,
          title: doc.title,
          description: doc.querySelector('meta[name="description"]')?.content || '',
          h1: Array.from(doc.getElementsByTagName('h1')).map(h1 => h1.textContent),
          mainContent: doc.querySelector('main')?.textContent ||
                      doc.querySelector('article')?.textContent ||
                      doc.body.textContent.substring(0, 1000)
        };

        // Store in vector database with better error logging
        try {
          console.log('Sending to API:', {
            url: content.url,
            title: content.title,
            contentLength: content.mainContent.length
          });

          // const apiResponse = await callAPI('store', {
          //   url: content.url,
          //   title: content.title,
          //   content: content.mainContent
          // });

          console.log('API Response:', apiResponse);
        } catch (apiError) {
          console.error('API Storage Error:', apiError);
          // Continue with the scraping even if storage fails
        }

        completed++;
        const progress = ((completed / urls.length) * 100).toFixed(1);
        console.log(`⏳ Progress: ${progress}% (${completed}/${urls.length}) - Scraped: ${url}`);

        return content;
      } catch (error) {
        console.error(`❌ Error processing ${url}:`, error);
        completed++;
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    scrapedContent.push(...batchResults.filter(Boolean));
  }

  console.log('✅ DONE! All pages scraped');
  console.log('📊 Summary:', {
    totalUrls: urls.length,
    successfulScrapes: scrapedContent.length,
    failedScrapes: urls.length - scrapedContent.length
  });

  if (scrapedContent.length > 0) {
    console.log('📄 Sample of scraped content (first page):', {
      url: scrapedContent[0].url,
      title: scrapedContent[0].title,
      description: scrapedContent[0].description,
      h1: scrapedContent[0].h1,
      contentPreview: scrapedContent[0].mainContent.substring(0, 500) + '...'
    });
  }

  await storeScrapedContent(scrapedContent);
  return scrapedContent;
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
      content: page.mainContent,
      domain: domain,
      metadata: {
        title: page.title
      }
    }));

    const response = await callAPI('/store', { documents });

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
    const results = await callAPI('search', { query });
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
    const scrapedContent = await scrapeAllPages();
    // Store the scraped content in a global variable for later use
    window.siteContent = scrapedContent;
    button.textContent = 'Scrape Site';
    button.disabled = false;
    addMessage(`Scraped ${scrapedContent.length} pages successfully! The content is now available for our conversation.`, false);
  } catch (error) {
    console.error('Failed to scrape site:', error);
    button.textContent = 'Scrape Site';
    button.disabled = false;
    addMessage('Sorry, there was an error scraping the site.', false);
  }
});
