import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { candidates } from './candidate.schema';
import { relations } from 'drizzle-orm';

export const blacklists = pgTable('blacklists', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .notNull()
    .references(() => candidates.id, {
      onDelete: 'cascade',
    }),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: integer('user_id').notNull(),
});

export const blacklistRelations = relations(blacklists, ({ one }) => ({
  candidate: one(candidates, {
    fields: [blacklists.candidateId],
    references: [candidates.id],
  }),
}));

export type Blacklist = typeof blacklists.$inferSelect;
export type NewBlacklist = typeof blacklists.$inferInsert;
