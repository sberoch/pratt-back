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
      seniorities,
      candidateFiles,
      candidates,
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
            minValue: 90,
            maxValue: 92,
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
            minValue: 90,
            maxValue: 92,
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
            minValue: 90,
            maxValue: 92,
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
            minValue: 90,
            maxValue: 93,
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
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
        },
      },

      candidates: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateSourceId: f.int({
            minValue: 90,
            maxValue: 92,
          }),
          stars: f.number({
            minValue: 1,
            maxValue: 5,
          }),
          dateOfBirth: f.date({
            minDate: new Date('1980-01-01'),
            maxDate: new Date('2004-01-01'),
          }),
          address: f.streetAddress(),
          gender: f.valuesFromArray({
            values: ['Hombre', 'Mujer'],
          }),
          phone: f.int({
            isUnique: true,
            minValue: 9900000,
            maxValue: 99999999,
          }),
          shortDescription: f.valuesFromArray({
            values: [
              'Software Engineer @ Google',
              'Full Stack Developer @ Amazon',
              'Data Scientist @ Tesla',
              'Machine Learning Engineer @ NVIDIA',
              'Game Developer @ Ubisoft',
              'Cloud Engineer @ Microsoft',
              'AI Researcher @ OpenAI',
              'Frontend Engineer @ Meta',
              'Security Analyst @ IBM',
              'Embedded Systems Engineer @ Intel',
            ],
            isUnique: true,
          }),
          linkedin: f.valuesFromArray({
            values: [
              'https://www.linkedin.com/in/johndoe',
              'https://www.linkedin.com/in/janedoe',
              'https://www.linkedin.com/in/alicedoe',
              'https://www.linkedin.com/in/bobdoe',
              'https://www.linkedin.com/in/charliedoe',
              'https://www.linkedin.com/in/davedoe',
              'https://www.linkedin.com/in/eve',
              'https://www.linkedin.com/in/frankdoe',
              'https://www.linkedin.com/in/gracedoe',
              'https://www.linkedin.com/in/helen',
            ],
            isUnique: true,
          }),
          documentNumber: f.int({
            isUnique: true,
            minValue: 20000000,
            maxValue: 45000000,
          }),
        },
      },

      candidateAreas: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          areaId: f.int({ minValue: 90, maxValue: 92 }),
        },
      },

      candidateIndustries: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          industryId: f.int({ minValue: 90, maxValue: 92 }),
        },
      },

      candidateSeniorities: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          seniorityId: f.int({ minValue: 90, maxValue: 93 }),
        },
      },

      candidateFilesRelation: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          fileId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
        },
      },

      comments: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 99,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          userId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },

      blacklists: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 90,
            maxValue: 92,
            isUnique: true,
          }),
          candidateId: f.int({ minValue: 90, maxValue: 99, isUnique: true }),
          userId: f.int({ minValue: 1, maxValue: 3 }),
        },
      },
    }));
    return true;
  }
}
