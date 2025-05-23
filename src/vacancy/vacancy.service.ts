import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray, SQL } from 'drizzle-orm';
import { Vacancy, vacancies } from '../common/database/schemas/vacancy.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  VacancyQueryParams,
  CreateVacancyDto,
  UpdateVacancyDto,
} from './vacancy.dto';
import { Candidate } from '../common/database/schemas/candidate.schema';
import { Company } from '../common/database/schemas/company.schema';
import { VacancyStatus } from '../common/database/schemas/vacancystatus.schema';
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
import { User } from '../common/database/schemas/user.schema';
import { CandidateVacancyStatus } from '../common/database/schemas/candidatevacancystatus.schema';
import { CandidateVacancy as CandidateVacancySchema } from '../common/database/schemas/candidatevacancy.schema';

type VacancyQueryResult = Omit<Vacancy, 'assignedTo' | 'createdBy'> & {
  status: VacancyStatus;
  filters: VacancyFilters & {
    areaIds: VacancyFiltersArea[];
    industryIds: VacancyFiltersIndustry[];
    seniorityIds: VacancyFiltersSeniority[];
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
  filters: VacancyFilters & {
    areaIds: number[];
    industryIds: number[];
    seniorityIds: number[];
  };
  company: Company;
  candidates: Array<Candidate & { status: CandidateVacancyStatus }>;
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
            areaIds: true,
            industryIds: true,
            seniorityIds: true,
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
            areaIds: true,
            industryIds: true,
            seniorityIds: true,
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

      if (updateVacancyDto.filters?.seniorityIds?.length) {
        await tx
          .delete(vacancyFiltersSeniorities)
          .where(
            eq(
              vacancyFiltersSeniorities.vacancyFiltersId,
              vacancy.vacancyFiltersId,
            ),
          );
        await tx.insert(vacancyFiltersSeniorities).values(
          updateVacancyDto.filters.seniorityIds.map((seniorityId) => ({
            vacancyFiltersId: vacancy.vacancyFiltersId,
            seniorityId,
          })),
        );
      }

      if (updateVacancyDto.filters?.areaIds?.length) {
        await tx
          .delete(vacancyFiltersAreas)
          .where(
            eq(vacancyFiltersAreas.vacancyFiltersId, vacancy.vacancyFiltersId),
          );
        await tx.insert(vacancyFiltersAreas).values(
          updateVacancyDto.filters.areaIds.map((areaId) => ({
            vacancyFiltersId: vacancy.vacancyFiltersId,
            areaId,
          })),
        );
      }

      if (updateVacancyDto.filters?.industryIds?.length) {
        await tx
          .delete(vacancyFiltersIndustries)
          .where(
            eq(
              vacancyFiltersIndustries.vacancyFiltersId,
              vacancy.vacancyFiltersId,
            ),
          );
        await tx.insert(vacancyFiltersIndustries).values(
          updateVacancyDto.filters.industryIds.map((industryId) => ({
            vacancyFiltersId: vacancy.vacancyFiltersId,
            industryId,
          })),
        );
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
            areaIds: result.filters?.areaIds?.map((a) => a.areaId) || [],
            industryIds:
              result.filters?.industryIds?.map((i) => i.industryId) || [],
            seniorityIds:
              result.filters?.seniorityIds?.map((s) => s.seniorityId) || [],
          }
        : null,
      company: result.company,
      candidates: result.candidateVacancies.map((cv) => ({
        ...cv.candidate,
        status: cv.candidateVacancyStatus,
      })),
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

    if (query.filters) {
      if (query.filters.gender) {
        const genderSubquery = this.db
          .select({ vacancyId: vacancies.id })
          .from(vacancyFilters)
          .innerJoin(
            vacancies,
            eq(vacancies.vacancyFiltersId, vacancyFilters.id),
          )
          .where(ilike(vacancyFilters.gender, query.filters.gender))
          .as('gender_subquery');

        filters.push(
          inArray(
            vacancies.id,
            this.db
              .select({ id: genderSubquery.vacancyId })
              .from(genderSubquery),
          ),
        );
      }

      if (query.filters.minAge) {
        const minAgeSubquery = this.db
          .select({ vacancyId: vacancies.id })
          .from(vacancyFilters)
          .innerJoin(
            vacancies,
            eq(vacancies.vacancyFiltersId, vacancyFilters.id),
          )
          .where(eq(vacancyFilters.minAge, query.filters.minAge))
          .as('min_age_subquery');

        filters.push(
          inArray(
            vacancies.id,
            this.db
              .select({ id: minAgeSubquery.vacancyId })
              .from(minAgeSubquery),
          ),
        );
      }

      if (query.filters.maxAge) {
        const maxAgeSubquery = this.db
          .select({ vacancyId: vacancies.id })
          .from(vacancyFilters)
          .innerJoin(
            vacancies,
            eq(vacancies.vacancyFiltersId, vacancyFilters.id),
          )
          .where(eq(vacancyFilters.maxAge, query.filters.maxAge))
          .as('max_age_subquery');

        filters.push(
          inArray(
            vacancies.id,
            this.db
              .select({ id: maxAgeSubquery.vacancyId })
              .from(maxAgeSubquery),
          ),
        );
      }

      if (query.filters.minStars) {
        const minStarsSubquery = this.db
          .select({ vacancyId: vacancies.id })
          .from(vacancyFilters)
          .innerJoin(
            vacancies,
            eq(vacancies.vacancyFiltersId, vacancyFilters.id),
          )
          .where(eq(vacancyFilters.minStars, String(query.filters.minStars)))
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

      if (query.filters.areaIds?.length) {
        const areaSubquery = this.db
          .select({ vacancyId: vacancies.id })
          .from(vacancyFiltersAreas)
          .innerJoin(
            vacancies,
            eq(
              vacancies.vacancyFiltersId,
              vacancyFiltersAreas.vacancyFiltersId,
            ),
          )
          .where(inArray(vacancyFiltersAreas.areaId, query.filters.areaIds))
          .as('area_subquery');

        filters.push(
          inArray(
            vacancies.id,
            this.db.select({ id: areaSubquery.vacancyId }).from(areaSubquery),
          ),
        );
      }

      if (query.filters.industryIds?.length) {
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
            inArray(
              vacancyFiltersIndustries.industryId,
              query.filters.industryIds,
            ),
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
      if (query.filters.seniorityIds?.length) {
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
              query.filters.seniorityIds,
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
    }

    if (query.createdBy) {
      filters.push(eq(vacancies.createdBy, query.createdBy));
    }

    if (query.assignedTo) {
      filters.push(eq(vacancies.assignedTo, query.assignedTo));
    }

    return filters.length > 0 ? and(...filters) : undefined;
  }
}
