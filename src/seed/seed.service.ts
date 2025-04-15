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
import { hashPassword, users } from '../common/database/schemas/user.schema';
import { UserRole } from '../user/user.roles';
import { companies } from '../common/database/schemas/company.schema';

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
      companies,
      users,
    });
    return true;
  }

  async populateDatabase() {
    const hashedPassword = await hashPassword('12345678');
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
      companies,
      users,
    }).refine((f) => ({
      areas: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Administración', 'Finanzas', 'Recursos Humanos'],
            isUnique: true,
          }),
        },
      },

      candidateSources: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
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
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Tecnología', 'Banca y Finanzas', 'Consultoría'],
            isUnique: true,
          }),
        },
      },

      seniorities: {
        count: 4,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9003,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Manager', 'Director', 'VP', 'C-Level'],
            isUnique: true,
          }),
        },
      },

      candidateFiles: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: [
              'CV1.pdf',
              'CV2.pdf',
              'CV3.pdf',
              'CV4.pdf',
              'CV5.pdf',
              'CV6.pdf',
              'CV7.pdf',
              'CV8.pdf',
              'CV9.pdf',
              'CV10.pdf',
            ],
            isUnique: true,
          }),
          url: f.valuesFromArray({
            values: [
              'https://example.com/file1.pdf',
              'https://example.com/file2.pdf',
              'https://example.com/file3.pdf',
              'https://example.com/file4.pdf',
              'https://example.com/file5.pdf',
              'https://example.com/file6.pdf',
              'https://example.com/file7.pdf',
              'https://example.com/file8.pdf',
              'https://example.com/file9.pdf',
              'https://example.com/file10.pdf',
            ],
            isUnique: true,
          }),
        },
      },

      candidates: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          name: f.fullName(),
          candidateSourceId: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          stars: f.number({
            minValue: 1,
            maxValue: 5,
          }),
          dateOfBirth: f.date({
            minDate: new Date('1970-01-01'),
            maxDate: new Date('2004-01-01'),
          }),
          address: f.streetAddress(),
          gender: f.valuesFromArray({
            values: ['Masculino', 'Femenino', 'Otro'],
          }),
          image: f.valuesFromArray({
            values: [
              'https://www.shutterstock.com/image-photo/passport-photo-serious-brazilian-young-600nw-1956224953.jpg',
              'https://media.v2.siweb.es/uploaded_thumb_big/50539061f56935f748726281f52004db/jurica_koletic_7yvzyzeitc8_unsplash_copia.jpg',
              'https://lirp.cdn-website.com/46764031/dms3rep/multi/opt/foto-carnet-ejemplo-header-348w.JPG',
              'https://galiciavisual.es/wp-content/uploads/2023/12/chico-atractivo-camisa-aislado-sobre-fondo-blanco.jpg',
              'https://as1.ftcdn.net/v2/jpg/01/57/67/88/1000_F_157678844_8bbNSQ5ZiGxFWhCEpLr0mAqm55E5onmm.jpg',
              'https://i.pinimg.com/474x/b8/91/fb/b891fb0046f2a92b99754d061710c1dc.jpg',
              'https://st2.depositphotos.com/2783505/7767/i/450/depositphotos_77676472-stock-photo-portrait-of-a-blonde-german.jpg',
              'https://industrial.unmsm.edu.pe/wp-content/uploads/2015/03/foto-carnet1.jpg',
              'https://fotomanias.com.ar/wp-content/uploads/2019/03/foto-carnet-fondo-celeste.jpg',
              'https://t4.ftcdn.net/jpg/00/85/77/75/360_F_85777561_m6EMdjM6Knkz7OLJmN5zr5ZeK359S3G5.jpg',
            ],
            isUnique: true,
          }),
          phone: f.int({
            isUnique: true,
            minValue: 9900000,
            maxValue: 99999999,
          }),
          shortDescription: f.valuesFromArray({
            values: [
              'Office Manager - Fortune 500 Company',
              'Executive Assistant for Global Corp',
              'HR Coordinator @ Tech Solutions',
              'Administrative Assistant in Healthcare Inc',
              'Operations Lead at Manufacturing Co',
              'Front Desk Supervisor | Hotel Chain',
              'Project Coordinator with Consulting Firm',
              'Office Administrator - Law Firm',
              'Executive Secretary to Financial Services',
              'Administrative Manager of Education Center',
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
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          areaId: f.int({ minValue: 9000, maxValue: 9002 }),
        },
      },

      candidateIndustries: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          industryId: f.int({ minValue: 9000, maxValue: 9002 }),
        },
      },

      candidateSeniorities: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          seniorityId: f.int({ minValue: 9000, maxValue: 9003 }),
        },
      },

      candidateFilesRelation: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          fileId: f.int({ minValue: 9000, maxValue: 9009, isUnique: true }),
        },
      },

      comments: {
        count: 10,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          userId: f.int({ minValue: 9000, maxValue: 9002 }),
        },
      },

      blacklists: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          userId: f.int({ minValue: 9000, maxValue: 9002 }),
        },
      },

      companies: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Apple', 'Google', 'Microsoft'],
            isUnique: true,
          }),
          description: f.valuesFromArray({
            values: [
              'Apple is an American multinational technology company',
              'Google is an American multinational technology company',
              'Microsoft is an American multinational technology company',
            ],
            isUnique: true,
          }),
        },
      },

      users: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          active: f.default({ defaultValue: true }),
          email: f.valuesFromArray({
            values: ['sberoch@fi.uba.ar', 'admin@admin.com', 'admin@gmail.com'],
            isUnique: true,
          }),
          password: f.valuesFromArray({
            values: [hashedPassword],
          }),
          role: f.valuesFromArray({
            values: [UserRole.ADMIN],
          }),
          createdAt: f.default({
            defaultValue: new Date(),
          }),
          lastLogin: f.default({
            defaultValue: null,
          }),
        },
      },
    }));
    return true;
  }
}
