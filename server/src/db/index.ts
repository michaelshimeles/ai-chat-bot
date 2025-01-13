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

    console.log('📝 Storing chat history:', { url, messages: chatMessages });
    try {
        if (!url || !chatMessages || !Array.isArray(chatMessages) || chatMessages.length === 0) {
            console.error('Invalid chat history data:', { url, chatMessages });
            throw new Error('Invalid chat history data: url and non-empty messages array required');
        }

        console.log(' Storing chat history for URL:', url);
        console.log(' Messages to store:', chatMessages);

        const messageInserts = chatMessages.map(message => {
            if (!message || !message.role || !message.content) {
                console.error('Invalid message format:', message);
                throw new Error('Invalid message format: role and content required');
            }

            return {
                url,
                role: message.role,
                content: message.content,
            };
        });

        console.log(' Prepared messages for insertion:', messageInserts);
        await db.insert(messages).values(messageInserts);
        console.log(' Successfully stored messages in database');

        return { success: true };
    } catch (error) {
        console.error(' Error storing chat history:', error);
        throw error;
    }
}

// Function to retrieve chat history for a URL
export async function getChatHistory(url: string): Promise<Message[]> {
    try {
        if (!url) {
            console.error('Invalid URL provided for chat history');
            throw new Error('URL is required to fetch chat history');
        }

        console.log(' Fetching chat history for URL:', url);
        const history = await db.select()
            .from(messages)
            .where(eq(messages.url, url))
            .orderBy(messages.created_at);

        console.log(` Found ${history.length} messages in history`);

        return history.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));
    } catch (error) {
        console.error(' Error retrieving chat history:', error);
        throw error;
    }
}
