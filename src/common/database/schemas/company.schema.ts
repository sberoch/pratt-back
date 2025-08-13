import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { vacancies } from './vacancy.schema';
import { CompanyStatus } from '../../../company/company.status';

export const companyStatusEnum = pgEnum(
  'movementStatus',
  Object.values(CompanyStatus) as [string, ...string[]],
);

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  status: companyStatusEnum('status').notNull(),
  clientName: text('client_name'),
  clientEmail: text('client_email'),
  clientPhone: text('client_phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const companyRelations = relations(companies, ({ many }) => ({
  vacancies: many(vacancies),
}));

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
