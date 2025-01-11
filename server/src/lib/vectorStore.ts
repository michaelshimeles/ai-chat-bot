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

// Single instance of the vector store
let vectorStoreInstance: NeonPostgres | null = null;

// Get or create vector store instance
async function getVectorStore(): Promise<NeonPostgres> {
    if (!vectorStoreInstance) {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL environment variable is not set');
        }

        vectorStoreInstance = await NeonPostgres.initialize(embeddings, {
            connectionString: process.env.POSTGRES_URL,
            tableName: 'scraped_content',
        });
    }
    return vectorStoreInstance;
}

// Add documents to vector store
export async function addDocuments(documents: ScrapedContent[]): Promise<void> {
    const vectorStore = await getVectorStore();
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

// Search for similar documents
export async function similaritySearch(query: string, k: number = 4): Promise<any[]> {
    const vectorStore = await getVectorStore();
    return await vectorStore.similaritySearch(query, k);
}
