import { openai } from "@ai-sdk/openai";
import { serve } from "@hono/node-server";
import { streamText } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";
import { VectorStore, ScrapedContent } from "./lib/vectorStore.js";
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
    const { documents } = await c.req.json<{ documents: ScrapedContent[] }>();
    await VectorStore.addDocuments(documents);
    return c.json({ success: true, message: "Documents stored successfully" });
  } catch (error) {
    console.error("Error storing documents:", error);
    return c.json({ success: false, error: "Failed to store documents" }, 500);
  }
});

app.get("/chat-history/:domain", async (c) => {
  try {
    const domain = c.req.param("domain");
    const messages = await getChatHistory(domain);
    
    return c.json({
      success: true,
      messages: messages
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
  const { messages, currentDomain } = await c.req.json();

  console.log("📝 Received messages:", messages);

  // Store chat history
  await storeChatHistory({
    url: currentDomain,
    messages: messages,
  });

  // Get relevant context from vector store
  const userMessage = messages[messages.length - 1].content;
  const relevantDocs = await VectorStore.similaritySearch(userMessage);

  // Filter documents by current domain
  const domainFilteredDocs = relevantDocs.filter(
    (doc: any) => doc.metadata && doc.metadata.domain === currentDomain
  );

  // Add context to the conversation
  const contextEnhancedMessages = [
    {
      role: "system",
      content:
        "You are a customer service assistant. Use the following context from the current website to help answer the user's question: " +
        domainFilteredDocs.map((doc: any) => doc.pageContent).join("\n\n") +
        "\n\nPlease respond in a friendly and helpful manner, providing clear and concise answers.",
    },
    ...messages,
  ];

  const result = streamText({
    model: openai("gpt-4"),
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

serve({ fetch: app.fetch, port: 8080 });
