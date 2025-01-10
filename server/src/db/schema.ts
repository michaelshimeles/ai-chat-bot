import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull(),
    role: text('role').notNull(), // 'user' or 'assistant'
    content: text('content').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
