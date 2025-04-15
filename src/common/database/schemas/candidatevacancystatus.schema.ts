import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const candidateVacancyStatuses = pgTable('candidate_vacancy_statuses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export type CandidateVacancyStatus =
  typeof candidateVacancyStatuses.$inferSelect;
export type NewCandidateVacancyStatus =
  typeof candidateVacancyStatuses.$inferInsert;
