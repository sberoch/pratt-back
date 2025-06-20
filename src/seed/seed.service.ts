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
import { candidateVacancyStatuses } from '../common/database/schemas/candidatevacancystatus.schema';
import { vacancyStatuses } from '../common/database/schemas/vacancystatus.schema';
import {
  vacancyFilters,
  vacancyFiltersAreas,
  vacancyFiltersIndustries,
  vacancyFiltersSeniorities,
} from '../common/database/schemas/vacancyfilters.schema';
import { vacancies } from '../common/database/schemas/vacancy.schema';
import { candidateVacancies } from '../common/database/schemas/candidatevacancy.schema';
import { CompanyStatus } from '../company/company.status';

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
      candidateVacancyStatuses,
      vacancyStatuses,
      vacancyFilters,
      vacancyFiltersSeniorities,
      vacancyFiltersAreas,
      vacancyFiltersIndustries,
      vacancies,
      candidateVacancies,
      users,
    });
    return true;
  }

  async populateDatabase() {
    const hashedPassword = await hashPassword('12345678');
    const seedData = [
      { id: 9000, name: 'No es el perfil', sort: 0, isInitial: false },
      { id: 9001, name: 'En revisión', sort: 1, isInitial: true },
      { id: 9002, name: 'Entrevista Pratt', sort: 2, isInitial: false },
      { id: 9003, name: 'Entrevista cliente 1', sort: 3, isInitial: false },
      { id: 9004, name: 'Entrevista cliente 2', sort: 4, isInitial: false },
      { id: 9005, name: 'Oferta', sort: 5, isInitial: false },
      { id: 9006, name: 'Contratado', sort: 6, isInitial: false },
    ];

    await this.db.insert(candidateVacancyStatuses).values(seedData);
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
      vacancyStatuses,
      vacancyFilters,
      vacancyFiltersSeniorities,
      vacancyFiltersAreas,
      vacancyFiltersIndustries,
      vacancies,
      candidateVacancies,
      users,
    }).refine((f) => ({
      areas: {
        count: 18,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9017,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: [
              'Administración',
              'Administración y Finanzas',
              'Comercial',
              'Compras',
              'Digital-Ecommerce',
              'Finanzas',
              'Legales',
              'Logística',
              'Marketing',
              'Mantenimiento',
              'Producción - Planta',
              'Project Management',
              'RRHH',
              'RRPP-RRII',
              'Seguridad',
              'Sistemas - Tecnología',
              'Supply Chain',
              'Sustentabilidad',
            ],
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
            values: ['LinkedIn', 'Interna', 'Referencia'],
            isUnique: true,
          }),
        },
      },

      industries: {
        count: 16,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9015,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: [
              'Automotriz',
              'Agro Negocios',
              'Banca',
              'Capital Markets',
              'Consumo Masivo',
              'Digital',
              'Energía',
              'Hotelería-Turismo',
              'Industria',
              'Laboratorio - Farma',
              'Logistica',
              'Minería',
              'Oil & Gas',
              'ONG',
              'Publicidad',
              'Retail - SMK',
            ],
            isUnique: true,
          }),
        },
      },

      seniorities: {
        count: 5,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9004,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: [
              'CEO',
              'Director',
              'Gerente',
              'Jefe - Team Lider',
              'Asistente Ejecutiva',
            ],
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
          stars: f.int({
            minValue: 1,
            maxValue: 5,
          }),
          dateOfBirth: f.date({
            minDate: new Date('1970-01-01'),
            maxDate: new Date('2004-01-01'),
          }),
          address: f.streetAddress(),
          gender: f.valuesFromArray({
            values: ['Masculino', 'Femenino'],
          }),
          image: f.valuesFromArray({
            values: [
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c1.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c2.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c3.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c4.webp',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c5.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c6.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c7.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c8.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c9.jpg',
              'https://ujhldxqtodzspjtgtjyr.supabase.co/storage/v1/object/public/pratt/c10.jpg',
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
          country: f.default({
            defaultValue: 'Argentina',
          }),
          deleted: f.default({
            defaultValue: false,
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
          areaId: f.int({ minValue: 9000, maxValue: 9017 }),
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
          industryId: f.int({ minValue: 9000, maxValue: 9015 }),
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
          seniorityId: f.int({ minValue: 9000, maxValue: 9004 }),
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
        count: 2,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9001,
            isUnique: true,
          }),
          candidateId: f.int({
            minValue: 9000,
            maxValue: 9009,
            isUnique: true,
          }),
          userId: f.int({ minValue: 9000, maxValue: 9001 }),
          reason: f.valuesFromArray({
            values: ['No cumple con los requisitos', 'Miente en el curriculum'],
            isUnique: false,
          }),
        },
      },

      companies: {
        count: 6,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9005,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: [
              'Volkswagen Argentina',
              'Salentein',
              'Corven',
              'Hospital Británico',
              'Laboratorios Elea',
              'Hospital Italiano',
            ],
            isUnique: true,
          }),
          description: f.valuesFromArray({
            values: [
              'Empresa de automotores',
              'Empresa de construcción',
              'Empresa de servicios',
              'Empresa de salud',
              'Empresa de laboratorios',
              'Empresa de hospitales',
            ],
            isUnique: true,
          }),
          status: f.valuesFromArray({
            values: [CompanyStatus.ACTIVO, CompanyStatus.PROSPECTO],
            isUnique: false,
          }),
        },
      },

      vacancyStatuses: {
        count: 4,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9003,
            isUnique: true,
          }),
          name: f.valuesFromArray({
            values: ['Abierta', 'Cancelada', 'Cubierta', 'Standby'],
            isUnique: true,
          }),
        },
      },

      vacancyFilters: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          minStars: f.int({
            minValue: 1,
            maxValue: 5,
          }),
          minAge: f.int({
            minValue: 18,
            maxValue: 29,
          }),
          maxAge: f.int({
            minValue: 30,
            maxValue: 65,
          }),
          gender: f.valuesFromArray({
            values: ['Masculino', 'Femenino'],
          }),
        },
      },

      vacancyFiltersSeniorities: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          vacancyFiltersId: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          seniorityId: f.int({ minValue: 9000, maxValue: 9004 }),
        },
      },

      vacancyFiltersAreas: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          vacancyFiltersId: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          areaId: f.int({ minValue: 9000, maxValue: 9017 }),
        },
      },

      vacancyFiltersIndustries: {
        count: 3,
        columns: {
          id: f.int({
            minValue: 9000,
            maxValue: 9002,
            isUnique: true,
          }),
          vacancyFiltersId: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          industryId: f.int({ minValue: 9000, maxValue: 9015 }),
        },
      },

      vacancies: {
        count: 15,
        columns: {
          id: f.intPrimaryKey(),
          companyId: f.int({
            minValue: 9000,
            maxValue: 9005,
          }),
          title: f.valuesFromArray({
            values: [
              'Director de Administración y Finanzas',
              'Gerente Comercial',
              'Jefe de Compras',
              'Director de Digital y Ecommerce',
              'Gerente de Finanzas',
              'Jefe de Legales',
              'Gerente de Logística',
              'Director de Marketing',
              'Jefe de Mantenimiento',
              'Gerente de Producción',
              'Director de Project Management',
              'Gerente de RRHH',
              'Jefe de Relaciones Públicas',
              'Director de Sistemas y Tecnología',
              'Asistente Ejecutiva CEO',
            ],
            isUnique: true,
          }),
          description: f.valuesFromArray({
            values: [
              'Buscamos Director de Administración y Finanzas con sólida experiencia en gestión financiera y administrativa para liderar equipos multidisciplinarios.',
              'Gerente Comercial con experiencia en desarrollo de estrategias de ventas y gestión de equipos comerciales de alto rendimiento.',
              'Jefe de Compras con expertise en negociación con proveedores, gestión de inventarios y optimización de costos de adquisición.',
              'Director de Digital y Ecommerce para liderar la transformación digital y estrategias de comercio electrónico de la compañía.',
              'Gerente de Finanzas especializado en análisis financiero, presupuestación y control de gestión con enfoque en rentabilidad.',
              'Jefe de Legales con experiencia en derecho corporativo, contratos comerciales y cumplimiento normativo en entorno empresarial.',
              'Gerente de Logística para optimizar cadena de suministro, distribución y operaciones logísticas a nivel nacional.',
              'Director de Marketing con visión estratégica para desarrollar campañas integrales y posicionamiento de marca en mercados competitivos.',
              'Jefe de Mantenimiento industrial con experiencia en gestión de activos, mantenimiento preventivo y optimización de procesos.',
              'Gerente de Producción con expertise en manufactura lean, control de calidad y gestión de operaciones industriales.',
              'Director de Project Management certificado PMP para liderar proyectos estratégicos y transformación organizacional.',
              'Gerente de RRHH especializado en desarrollo organizacional, gestión del talento y cultura empresarial.',
              'Jefe de Relaciones Públicas y Comunicaciones para gestionar imagen corporativa y relaciones con stakeholders externos.',
              'Director de Sistemas y Tecnología para liderar transformación digital, infraestructura IT y innovación tecnológica.',
              'Asistente Ejecutiva para CEO con alta capacidad organizativa, manejo de agenda ejecutiva y coordinación de proyectos estratégicos.',
            ],
            isUnique: true,
          }),
          statusId: f.int({
            minValue: 9000,
            maxValue: 9003,
          }),
          vacancyFiltersId: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          createdBy: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          assignedTo: f.int({
            minValue: 9000,
            maxValue: 9002,
          }),
          createdAt: f.date({
            minDate: new Date('2024-01-01'),
            maxDate: new Date('2025-01-01'),
          }),
          updatedAt: f.default({
            defaultValue: new Date(),
          }),
        },
      },

      candidateVacancies: {
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
          vacancyId: f.int({
            minValue: 1,
            maxValue: 3,
          }),
          candidateVacancyStatusId: f.int({
            minValue: 9000,
            maxValue: 9005,
          }),
          notes: f.valuesFromArray({
            values: [
              null,
              'El candidato es muy bueno',
              'El candidato es regular',
              'El candidato es malo',
            ],
            isUnique: false,
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
            values: ['sberoch@gmail.com', 'ec@pratt.com.ar', 'admin@gmail.com'],
            isUnique: true,
          }),
          name: f.fullName(),
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
