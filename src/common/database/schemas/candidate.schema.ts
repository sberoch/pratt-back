import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core';

import { areas } from './area.schema';
import { candidateFiles } from './candidatefile.schema';
import { candidateSources } from './candidatesource.schema';
import { industries } from './industry.schema';
import { seniorities } from './seniority.schema';

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  shortDescription: text('short_description'),
  email: text('email').notNull(),
  linkedin: text('linkedin'),
  address: text('address'),
  documentNumber: text('document_number'),
  phone: text('phone'),
  deleted: boolean('deleted').default(false),
  sourceId: integer('source_id').references(() => candidateSources.id, {
    onDelete: 'cascade',
  }),
  stars: numeric('stars'),
  blacklisted: boolean('blacklisted').default(false),
});

export const candidateAreas = pgTable('candidate_areas', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => candidates.id, { onDelete: 'cascade' })
    .notNull(),
  areaId: integer('area_id')
    .references(() => areas.id, { onDelete: 'cascade' })
    .notNull(),
});

export const candidateIndustries = pgTable('candidate_industries', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => candidates.id, { onDelete: 'cascade' })
    .notNull(),
  industryId: integer('industry_id')
    .references(() => industries.id, { onDelete: 'cascade' })
    .notNull(),
});

export const candidateSeniorities = pgTable('candidate_seniorities', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => candidates.id, { onDelete: 'cascade' })
    .notNull(),
  seniorityId: integer('seniority_id')
    .references(() => seniorities.id, { onDelete: 'cascade' })
    .notNull(),
});

export const candidateFilesRelation = pgTable('candidate_candidate_files', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id')
    .references(() => candidates.id, { onDelete: 'cascade' })
    .notNull(),
  fileId: integer('file_id')
    .references(() => candidateFiles.id, { onDelete: 'cascade' })
    .notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
