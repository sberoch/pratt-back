import { Inject, Injectable } from '@nestjs/common';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { reset, seed } from 'drizzle-seed';
import { seniorities } from '../common/database/schemas/seniority.schema';
import {
  candidateAreas,
  candidateIndustries,
  candidateSeniorities,
  candidateFilesRelation,
  candidates,
} from '../common/database/schemas/candidate.schema';
import { candidateSources } from '../common/database/schemas/candidatesource.schema';
import { comments } from '../common/database/schemas/comment.schema';
import { candidateFiles } from '../common/database/schemas/candidatefile.schema';
import { industries } from '../common/database/schemas/industry.schema';
import { areas } from '../common/database/schemas/area.schema';
import { blacklists } from '../common/database/schemas/blacklist.schema';

@Injectable()
export class SeedService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async resetDatabase() {
    await reset(this.db, {
      areas,
      blacklists,
      candidates,
      candidateFiles,
      candidateSources,
      comments,
      industries,
      seniorities,
      candidateAreas,
      candidateIndustries,
      candidateSeniorities,
      candidateFilesRelation,
    });
    return true;
  }

  async populateDatabase() {
    await seed(this.db, {
      areas,
      candidateSources,
      industries,
      candidateFiles,
      candidates,
      seniorities,
      candidateAreas,
      candidateIndustries,
      candidateSeniorities,
      candidateFilesRelation,
      comments,
      blacklists,
    }).refine((f) => ({
      areas: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 3,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['IT', 'Ingenieria', 'RRHH'],
            isUnique: true,
          }),
        },
      },

      candidateSources: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 3,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['LinkedIn', 'Twitter', 'Facebook'],
            isUnique: true,
          }),
        },
      },

      industries: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 3,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Industria 1', 'Industria 2', 'Industria 3'],
            isUnique: true,
          }),
        },
      },

      seniorities: {
        count: 4,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 4,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Junior', 'Semisenior', 'Senior', 'Lead'],
            isUnique: true,
          }),
        },
      },

      candidateFiles: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
        },
      },

      candidates: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateSourceId: f.int({
            minValue: 1,
            maxValue: 3,
          }),
          stars: f.number({
            minValue: 1,
            maxValue: 5,
          }),
        },
      },

      candidateAreas: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          areaId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },

      candidateIndustries: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          industryId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },

      candidateSeniorities: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          seniorityId: f.int({ minValue: 1, maxValue: 4 }),
        },
      },

      candidateFilesRelation: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          fileId: f.int({ minValue: 1, maxValue: 10 }),
        },
      },

      comments: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 10,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          userId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },

      blacklists: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 1,
            maxValue: 3,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 1, maxValue: 10, isUnique: true }),
          userId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },
    }));
    return true;
  }
}
