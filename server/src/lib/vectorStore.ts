import { NeonPostgres } from '@langchain/community/vectorstores/neon';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const embeddings = new OpenAIEmbeddings({
    dimensions: 1536, // Using 1536 for GPT-4 compatibility
    modelName: 'text-embedding-3-large',
});

export interface ScrapedContent {
    url: string;
    content: string;
    domain: string;
    metadata?: Record<string, any>;
}

export class VectorStore {
    private static instance: NeonPostgres | null = null;

    static async getInstance(): Promise<NeonPostgres> {
        if (!this.instance) {
            if (!process.env.POSTGRES_URL) {
                throw new Error('POSTGRES_URL environment variable is not set');
            }

            this.instance = await NeonPostgres.initialize(embeddings, {
                connectionString: process.env.POSTGRES_URL,
                tableName: 'scraped_content', // Custom table name
            });
        }
        return this.instance;
    }

    static async addDocuments(documents: ScrapedContent[]): Promise<void> {
        const vectorStore = await this.getInstance();
        const texts = documents.map(doc => doc.content);
        const metadatas = documents.map(doc => ({
            url: doc.url,
            domain: doc.domain,
            ...doc.metadata,
        }));

        await vectorStore.addDocuments(texts.map((text, i) => ({
            pageContent: text,
            metadata: metadatas[i],
        })));
    }

    static async similaritySearch(query: string, k: number = 4): Promise<any[]> {
        const vectorStore = await this.getInstance();
        return await vectorStore.similaritySearch(query, k);
    }
}
