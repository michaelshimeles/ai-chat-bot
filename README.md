# Site Assistant Chrome Extension

A Chrome extension that provides an AI-powered chat interface for any website. The assistant can scrape the current site's content and use it to provide contextually relevant answers to your questions.

## Features

- 🤖 AI-powered chat interface using GPT-4
- 📝 Real-time website content scraping
- 🔍 Context-aware responses based on the current website
- 💨 Fast and lightweight
- 🎯 Domain-specific responses (only uses content from the current site)
- 💬 Streaming responses with typing indicators

## Project Structure

```
extension-chatbot/
├── extension/          # Chrome Extension
│   ├── content.js     # Main extension logic
│   └── manifest.json  # Extension manifest
└── server/            # Backend Server
    ├── src/
    │   ├── index.ts   # Main server file
    │   └── lib/       # Server utilities
    │       └── vectorStore.ts  # Vector storage for embeddings
    ├── .env           # Environment variables
    └── package.json   # Server dependencies
```

## Setup

### Prerequisites

- Node.js (v20 or later)
- OpenAI API Key
- Neon PostgreSQL Database

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```
   OPENAI_API_KEY=your_openai_api_key
   POSTGRES_URL=your_neon_postgres_url
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` directory

## Usage

1. Click the extension icon in your browser
2. Click "Scrape Site" to analyze the current webpage
3. Ask questions about the website's content
4. Get AI-powered responses based on the scraped content

## Technical Details

- Uses OpenAI's GPT-4 for generating responses
- Implements vector similarity search for relevant context retrieval
- Stores embeddings in a Neon PostgreSQL database
- Uses streaming responses for a better user experience

## Environment Variables

### Server
- `OPENAI_API_KEY`: Your OpenAI API key
- `POSTGRES_URL`: Your Neon PostgreSQL connection string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for any purpose.