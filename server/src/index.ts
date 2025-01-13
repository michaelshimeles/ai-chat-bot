import { openai } from "@ai-sdk/openai";
import { serve } from "@hono/node-server";
import { streamText } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";
import {
  addDocuments,
  similaritySearch,
  ScrapedContent,
} from "./lib/vectorStore.js";
import { storeChatHistory, getChatHistory } from "./db/index.js";

const app = new Hono();

// Add CORS middleware
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello from Hono!");
});

// Endpoint to store scraped content
app.post("/store", async (c) => {
  try {
    console.log("📥 Received store request");
    const body = await c.req.json();
    console.log("📦 Request body:", body);

    if (!body.documents || !Array.isArray(body.documents)) {
      console.error(
        "❌ Invalid request: documents array missing or not an array"
      );
      return c.json(
        { success: false, error: "Invalid request: documents array required" },
        400
      );
    }

    const { documents } = body;
    console.log(`📊 Processing ${documents.length} documents`);

    await addDocuments(documents);
    console.log("✅ Documents stored successfully");

    return c.json({ success: true, message: "Documents stored successfully" });
  } catch (error) {
    console.error("❌ Error storing documents:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

app.get("/chat-history/:domain", async (c) => {
  try {
    const domain = c.req.param("domain");
    const messages = await getChatHistory(domain);

    return c.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return c.json(
      { success: false, error: "Failed to fetch chat history" },
      500
    );
  }
});

app.post("/", async (c) => {
  const { messages, domain } = await c.req.json();

  const currentDomain = domain;

  console.log("📝 Received messages:", messages);

  // Store chat history
  await storeChatHistory({
    url: currentDomain,
    messages: messages,
  });

  // Get relevant context from vector store
  const userMessage = messages[messages.length - 1].content;
  const relevantDocs = await similaritySearch(userMessage);

  // Filter documents by current domain
  const domainFilteredDocs = relevantDocs.filter(
    (doc: any) => doc.metadata && doc.metadata.domain === currentDomain
  );

  // Format context for better readability
  const formattedContext = domainFilteredDocs
    .map((doc: any) => `Content from ${doc.metadata.url}:\n${doc.pageContent}`)
    .join("\n\n");

  // Add context to the conversation
  const contextEnhancedMessages = [
    {
      role: "system",
      content: `You are a helpful AI assistant with access to the current website's content.
I have scraped and indexed the content from this website, and I will provide relevant sections based on the user's questions.

Here is the relevant content from ${currentDomain}:
${formattedContext}

Instructions:
1. Use the above content to provide accurate answers about this website
2. If the provided content doesn't contain enough information to answer the question, acknowledge that and suggest what other information might be needed
3. Always maintain a helpful and friendly tone
4. If you quote or reference specific content, mention that it's from the website

Please provide clear and concise answers based on this context.`,
    },
    ...messages,
  ];

  const result = streamText({
    model: openai("gpt-4o"),
    messages: contextEnhancedMessages,
    onFinish: ({ text, toolResults, toolCalls, finishReason }) => {
      // Store ai response in history
      storeChatHistory({
        url: currentDomain,
        messages: [{ role: "assistant", content: text }],
      });
    },
  });

  c.header("Content-Type", "text/plain; charset=utf-8");

  return stream(c, (stream) => stream.pipe(result.textStream));
});

// Start server
const port = process.env.PORT || 8080;
serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`🚀 Server running at http://localhost:${port}`);
console.log(`
📝 Available endpoints:
- GET  /         Health check
- POST /store    Store scraped content
- GET  /chat-history/:domain  Get chat history
- POST /         Chat completion
`);
