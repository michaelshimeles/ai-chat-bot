import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { messages } from './schema.js';
// Initialize the database connection
const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle(sql);

// Types for our messages
export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export type ChatHistory = {
    url: string;
    messages: Message[];
};

// Function to store chat messages
export async function storeChatHistory({ url, messages: chatMessages }: ChatHistory) {
    try {
        const messageInserts = chatMessages.map(message => ({
            url,
            role: message.role,
            content: message.content,
        }));

        await db.insert(messages).values(messageInserts);
        return { success: true };
    } catch (error) {
        console.error('Error storing chat history:', error);
        throw error;
    }
}

// Function to retrieve chat history for a URL
export async function getChatHistory(url: string): Promise<Message[]> {
    try {
        const history = await db.select()
            .from(messages)
            .where(eq(messages.url, url))
            .orderBy(messages.created_at);

        return history.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));
    } catch (error) {
        console.error('Error retrieving chat history:', error);
        throw error;
    }
}
