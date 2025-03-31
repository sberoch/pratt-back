import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: integer('user_id').notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
