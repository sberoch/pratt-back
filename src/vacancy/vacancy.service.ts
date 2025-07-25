import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  SQL,
  sql,
} from 'drizzle-orm';
import { Area } from 'src/common/database/schemas/area.schema';
import { Industry } from 'src/common/database/schemas/industry.schema';
import { Seniority } from 'src/common/database/schemas/seniority.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { Candidate } from '../common/database/schemas/candidate.schema';
import { CandidateVacancy as CandidateVacancySchema } from '../common/database/schemas/candidatevacancy.schema';
import { CandidateVacancyStatus } from '../common/database/schemas/candidatevacancystatus.schema';
import { Company } from '../common/database/schemas/company.schema';
import { User } from '../common/database/schemas/user.schema';
import { vacancies, Vacancy } from '../common/database/schemas/vacancy.schema';
import {
  vacancyFilters,
  VacancyFilters,
  VacancyFiltersArea,
  vacancyFiltersAreas,
  vacancyFiltersIndustries,
  VacancyFiltersIndustry,
  vacancyFiltersSeniorities,
  VacancyFiltersSeniority,
} from '../common/database/schemas/vacancyfilters.schema';
import { VacancyStatus } from '../common/database/schemas/vacancystatus.schema';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancyQueryParams,
} from './vacancy.dto';

type VacancyQueryResult = Omit<Vacancy, 'assignedTo' | 'createdBy'> & {
  status: VacancyStatus;
  filters: VacancyFilters & {
    areaIds: Array<VacancyFiltersArea & { area: Area }>;
    industryIds: Array<VacancyFiltersIndustry & { industry: Industry }>;
    seniorityIds: Array<VacancyFiltersSeniority & { seniority: Seniority }>;
  };
  company: Company;
  candidateVacancies: Array<
    CandidateVacancySchema & {
      candidate: Candidate;
      candidateVacancyStatus: CandidateVacancyStatus;
    }
  >;
  createdBy: User;
  assignedTo: User;
};

export type VacancyApiResponse = Omit<Vacancy, 'assignedTo' | 'createdBy'> & {
  status: VacancyStatus;
  filters:
    | (VacancyFilters & {
        areas: Area[];
        industries: Industry[];
        seniorities: Seniority[];
      })
    | null;
  company: Company;
  candidates: Array<
    CandidateVacancySchema & {
      candidate: Candidate;
      status: CandidateVacancyStatus;
    }
  >;
  createdBy: Omit<User, 'password'>;
  assignedTo: Omit<User, 'password'>;
};

@Injectable()
export class VacancyService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: VacancyQueryParams,
  ): Promise<PaginatedResponse<Partial<VacancyApiResponse>>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.vacancies.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
      with: {
        status: true,
        filters: {
          with: {
            areaIds: {
              with: {
                area: true,
              },
            },
            industryIds: {
              with: {
                industry: true,
              },
            },
            seniorityIds: {
              with: {
                seniority: true,
              },
            },
          },
        },
        company: true,
        candidateVacancies: {
          with: {
            candidate: true,
            candidateVacancyStatus: true,
          },
        },
        createdBy: true,
        assignedTo: true,
      },
    });

    const countQuery = this.db
      .select({ count: count(vacancies.id) })
      .from(vacancies)
      .where(whereClause);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);

    const parsedItems = items.map(this.transformQueryResult);
    return paginatedResponse(parsedItems, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const vacancy = await this.db.query.vacancies.findFirst({
      where: eq(vacancies.id, id),
      with: {
        status: true,
        filters: {
          with: {
            areaIds: {
              with: {
                area: true,
              },
            },
            industryIds: {
              with: {
                industry: true,
              },
            },
            seniorityIds: {
              with: {
                seniority: true,
              },
            },
          },
        },
        company: true,
        candidateVacancies: {
          with: {
            candidate: true,
            candidateVacancyStatus: true,
          },
        },
        createdBy: true,
        assignedTo: true,
      },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return this.transformQueryResult(vacancy);
  }

  async create(createVacancyDto: CreateVacancyDto) {
    return this.db.transaction(async (tx) => {
      const [filters] = await tx
        .insert(vacancyFilters)
        .values({
          ...createVacancyDto.filters,
        })
        .returning();

      if (!filters) throw new Error('Error creating filters');

      if (createVacancyDto.filters.seniorityIds?.length) {
        await tx.insert(vacancyFiltersSeniorities).values(
          createVacancyDto.filters.seniorityIds.map((seniorityId) => ({
            vacancyFiltersId: filters.id,
            seniorityId,
          })),
        );
      }

      if (createVacancyDto.filters.areaIds?.length) {
        await tx.insert(vacancyFiltersAreas).values(
          createVacancyDto.filters.areaIds.map((areaId) => ({
            vacancyFiltersId: filters.id,
            areaId,
          })),
        );
      }

      if (createVacancyDto.filters.industryIds?.length) {
        await tx.insert(vacancyFiltersIndustries).values(
          createVacancyDto.filters.industryIds.map((industryId) => ({
            vacancyFiltersId: filters.id,
            industryId,
          })),
        );
      }

      const [vacancy] = await tx
        .insert(vacancies)
        .values({ ...createVacancyDto, vacancyFiltersId: filters.id } as any)
        .returning();

      if (!vacancy) throw new Error('Error creating vacancy');

      return vacancy;
    });
  }

  async update(id: number, updateVacancyDto: UpdateVacancyDto) {
    const vacancy = await this.db.transaction(async (tx) => {
      const [vacancy] = await tx
        .update(vacancies)
        .set({ ...updateVacancyDto, updatedAt: new Date() } as Partial<Vacancy>)
        .where(eq(vacancies.id, id))
        .returning();

      if (updateVacancyDto.filters) {
        await tx
          .update(vacancyFilters)
          .set({ ...updateVacancyDto.filters })
          .where(eq(vacancyFilters.id, vacancy.vacancyFiltersId));
      }

      if (
        updateVacancyDto.filters?.seniorityIds?.length ||
        updateVacancyDto.filters?.seniorityIds === null
      ) {
        await tx
          .delete(vacancyFiltersSeniorities)
          .where(
            eq(
              vacancyFiltersSeniorities.vacancyFiltersId,
              vacancy.vacancyFiltersId,
            ),
          );
        if (updateVacancyDto.filters?.seniorityIds?.length) {
          await tx.insert(vacancyFiltersSeniorities).values(
            updateVacancyDto.filters.seniorityIds.map((seniorityId) => ({
              vacancyFiltersId: vacancy.vacancyFiltersId,
              seniorityId,
            })),
          );
        }
      }

      if (
        updateVacancyDto.filters?.areaIds?.length ||
        updateVacancyDto.filters?.areaIds === null
      ) {
        await tx
          .delete(vacancyFiltersAreas)
          .where(
            eq(vacancyFiltersAreas.vacancyFiltersId, vacancy.vacancyFiltersId),
          );
        if (updateVacancyDto.filters?.areaIds?.length) {
          await tx.insert(vacancyFiltersAreas).values(
            updateVacancyDto.filters.areaIds.map((areaId) => ({
              vacancyFiltersId: vacancy.vacancyFiltersId,
              areaId,
            })),
          );
        }
      }

      if (
        updateVacancyDto.filters?.industryIds?.length ||
        updateVacancyDto.filters?.industryIds === null
      ) {
        await tx
          .delete(vacancyFiltersIndustries)
          .where(
            eq(
              vacancyFiltersIndustries.vacancyFiltersId,
              vacancy.vacancyFiltersId,
            ),
          );
        if (updateVacancyDto.filters?.industryIds?.length) {
          await tx.insert(vacancyFiltersIndustries).values(
            updateVacancyDto.filters.industryIds.map((industryId) => ({
              vacancyFiltersId: vacancy.vacancyFiltersId,
              industryId,
            })),
          );
        }
      }

      return vacancy;
    });
    return vacancy;
  }

  async remove(id: number) {
    const [vacancy] = await this.db
      .delete(vacancies)
      .where(eq(vacancies.id, id))
      .returning();

    if (!vacancy) throw new NotFoundException('Vacancy not found');

    await this.db
      .delete(vacancyFilters)
      .where(eq(vacancyFilters.id, vacancy.vacancyFiltersId));

    return vacancy;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */

  private transformQueryResult(result: VacancyQueryResult): VacancyApiResponse {
    const { status, filters, company, candidateVacancies, ...rest } = result;
    const { password: _createdByPassword, ...createdBy } = result.createdBy;
    const { password: _assignedToPassword, ...assignedTo } = result.assignedTo;

    return {
      ...rest,
      status: result.status,
      filters: filters
        ? {
            ...result.filters,
            areas: result.filters?.areaIds?.map((a) => a.area) || [],
            industries:
              result.filters?.industryIds?.map((i) => i.industry) || [],
            seniorities:
              result.filters?.seniorityIds?.map((s) => s.seniority) || [],
          }
        : null,
      company: result.company,
      candidates: result.candidateVacancies
        .map((cv) => {
          const { candidateVacancyStatus, ...rest } = cv;
          return {
            ...rest,
            status: candidateVacancyStatus,
          };
        })
        .filter((c) => c.candidate.deleted === false),
      createdBy: createdBy,
      assignedTo: assignedTo,
    };
  }

  private buildOrderBy(params: VacancyQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = vacancies[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(query: VacancyQueryParams) {
    const filters: SQL[] = [];
    if (query.id) {
      filters.push(eq(vacancies.id, query.id));
    }
    if (query.title) {
      filters.push(ilike(vacancies.title, `%${query.title}%`));
    }
    if (query.description) {
      filters.push(ilike(vacancies.description, `%${query.description}%`));
    }

    if (query.statusId) {
      filters.push(eq(vacancies.statusId, query.statusId));
    }

    if (query.companyId) {
      filters.push(eq(vacancies.companyId, query.companyId));
    }

    if (query.filterGender) {
      const genderSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(ilike(vacancyFilters.gender, query.filterGender))
        .as('gender_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db.select({ id: genderSubquery.vacancyId }).from(genderSubquery),
        ),
      );
    }

    if (query.filterMinAge) {
      const minAgeSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(eq(vacancyFilters.minAge, query.filterMinAge))
        .as('min_age_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db.select({ id: minAgeSubquery.vacancyId }).from(minAgeSubquery),
        ),
      );
    }

    if (query.filterMaxAge) {
      const maxAgeSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(eq(vacancyFilters.maxAge, query.filterMaxAge))
        .as('max_age_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db.select({ id: maxAgeSubquery.vacancyId }).from(maxAgeSubquery),
        ),
      );
    }

    if (query.filterMinStars) {
      const minStarsSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(eq(vacancyFilters.minStars, String(query.filterMinStars)))
        .as('min_stars_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: minStarsSubquery.vacancyId })
            .from(minStarsSubquery),
        ),
      );
    }

    if (query.filterAreaIds?.length) {
      const areaSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFiltersAreas)
        .innerJoin(
          vacancies,
          eq(vacancies.vacancyFiltersId, vacancyFiltersAreas.vacancyFiltersId),
        )
        .where(inArray(vacancyFiltersAreas.areaId, query.filterAreaIds))
        .as('area_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db.select({ id: areaSubquery.vacancyId }).from(areaSubquery),
        ),
      );
    }

    if (query.filterIndustryIds?.length) {
      const industrySubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFiltersIndustries)
        .innerJoin(
          vacancies,
          eq(
            vacancies.vacancyFiltersId,
            vacancyFiltersIndustries.vacancyFiltersId,
          ),
        )
        .where(
          inArray(vacancyFiltersIndustries.industryId, query.filterIndustryIds),
        )
        .as('industry_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: industrySubquery.vacancyId })
            .from(industrySubquery),
        ),
      );
    }

    if (query.filterSeniorityIds?.length) {
      const senioritySubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFiltersSeniorities)
        .innerJoin(
          vacancies,
          eq(
            vacancies.vacancyFiltersId,
            vacancyFiltersSeniorities.vacancyFiltersId,
          ),
        )
        .where(
          inArray(
            vacancyFiltersSeniorities.seniorityId,
            query.filterSeniorityIds,
          ),
        )
        .as('seniority_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: senioritySubquery.vacancyId })
            .from(senioritySubquery),
        ),
      );
    }

    if (query.filterCountries?.length) {
      const arr = query.filterCountries;
      const sqlArray = sql`ARRAY[${sql.join(
        arr.map((v) => sql`${v}`),
        sql`, `,
      )}]::text[]`;
      const countriesSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(sql`${vacancyFilters.countries} && ${sqlArray}`)
        .as('countries_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: countriesSubquery.vacancyId })
            .from(countriesSubquery),
        ),
      );
    }

    if (query.filterProvinces?.length) {
      const arr = query.filterProvinces;
      const sqlArray = sql`ARRAY[${sql.join(
        arr.map((v) => sql`${v}`),
        sql`, `,
      )}]::text[]`;
      const provincesSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(sql`${vacancyFilters.provinces} && ${sqlArray}`)
        .as('provinces_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: provincesSubquery.vacancyId })
            .from(provincesSubquery),
        ),
      );
    }

    if (query.filterLanguages?.length) {
      const arr = query.filterLanguages;
      const sqlArray = sql`ARRAY[${sql.join(
        arr.map((v) => sql`${v}`),
        sql`, `,
      )}]::text[]`;
      const languagesSubquery = this.db
        .select({ vacancyId: vacancies.id })
        .from(vacancyFilters)
        .innerJoin(vacancies, eq(vacancies.vacancyFiltersId, vacancyFilters.id))
        .where(sql`${vacancyFilters.languages} && ${sqlArray}`)
        .as('languages_subquery');

      filters.push(
        inArray(
          vacancies.id,
          this.db
            .select({ id: languagesSubquery.vacancyId })
            .from(languagesSubquery),
        ),
      );
    }

    if (query.createdById) {
      filters.push(eq(vacancies.createdBy, query.createdById));
    }

    if (query.assignedToId) {
      filters.push(eq(vacancies.assignedTo, query.assignedToId));
    }

    if (query.search) {
      filters.push(
        or(
          ilike(vacancies.title, `%${query.search}%`),
          ilike(sql`${vacancies.id}::text`, `%${query.search}%`),
        ),
      );
    }

    return filters.length > 0 ? and(...filters) : undefined;
  }
}
