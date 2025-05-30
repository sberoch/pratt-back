import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, SQL } from 'drizzle-orm';
import {
  candidateVacancies,
  CandidateVacancy,
} from '../common/database/schemas/candidatevacancy.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  CreateCandidateVacancyDto,
  CandidateVacancyQueryParams,
  UpdateCandidateVacancyDto,
} from './candidatevacancy.dto';
import { candidateVacancyStatuses } from '../common/database/schemas/candidatevacancystatus.schema';
import { candidates } from '../common/database/schemas/candidate.schema';

@Injectable()
export class CandidateVacancyService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateVacancyQueryParams,
  ): Promise<PaginatedResponse<CandidateVacancy>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.candidateVacancies.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
      with: {
        candidate: true,
        vacancy: {
          with: {
            company: true
          }
        },
        candidateVacancyStatus: true,
      },
    });

    const countQuery = this.db
      .select({ count: count(candidateVacancies.id) })
      .from(candidateVacancies)
      .where(whereClause);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidateVacancy = await this.db.query.candidateVacancies.findFirst({
      where: eq(candidateVacancies.id, id),
      with: {
        candidate: true,
        vacancy: {
          with: {
            company: true
          }
        },
        candidateVacancyStatus: true,
      },
    });
    if (!candidateVacancy) throw new NotFoundException('Not found');
    return candidateVacancy;
  }

  async create(createCandidateVacancyDto: CreateCandidateVacancyDto) {
    return await this.db.transaction(async (tx) => {
      const status = await tx.query.candidateVacancyStatuses.findFirst({
        where: eq(
          candidateVacancyStatuses.id,
          createCandidateVacancyDto.candidateVacancyStatusId,
        ),
      });

      const maxSortStatus = await tx.query.candidateVacancyStatuses.findFirst({
        orderBy: desc(candidateVacancyStatuses.sort),
      });

      if (status && maxSortStatus && status.sort === maxSortStatus.sort) {
        await tx
          .update(candidates)
          .set({ isInCompanyViaPratt: true } as any)
          .where(eq(candidates.id, createCandidateVacancyDto.candidateId));
      }

      const [candidateVacancy] = await tx
        .insert(candidateVacancies)
        .values(createCandidateVacancyDto)
        .returning();

      return candidateVacancy;
    });
  }

  async update(
    id: number,
    updateCandidateVacancyDto: UpdateCandidateVacancyDto,
  ) {
    return await this.db.transaction(async (tx) => {
      if (updateCandidateVacancyDto.candidateVacancyStatusId) {
        const status = await tx.query.candidateVacancyStatuses.findFirst({
          where: eq(
            candidateVacancyStatuses.id,
            updateCandidateVacancyDto.candidateVacancyStatusId,
          ),
        });

        const maxSortStatus = await tx.query.candidateVacancyStatuses.findFirst(
          {
            orderBy: desc(candidateVacancyStatuses.sort),
          },
        );

        if (status && maxSortStatus && status.sort === maxSortStatus.sort) {
          const candidateId =
            updateCandidateVacancyDto.candidateId ??
            (
              await tx.query.candidateVacancies.findFirst({
                where: eq(candidateVacancies.id, id),
                columns: { candidateId: true },
              })
            )?.candidateId;

          if (candidateId) {
            await tx
              .update(candidates)
              .set({ isInCompanyViaPratt: true } as any)
              .where(eq(candidates.id, candidateId));
          }
        }
      }

      const [candidateVacancy] = await tx
        .update(candidateVacancies)
        .set(updateCandidateVacancyDto)
        .where(eq(candidateVacancies.id, id))
        .returning();

      return candidateVacancy;
    });
  }

  async remove(id: number) {
    const [candidateVacancy] = await this.db
      .delete(candidateVacancies)
      .where(eq(candidateVacancies.id, id))
      .returning();
    return candidateVacancy;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private buildOrderBy(params: CandidateVacancyQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = candidateVacancies[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(params: CandidateVacancyQueryParams) {
    const filters: SQL[] = [];

    if (params.id) {
      filters.push(eq(candidateVacancies.id, params.id));
    }

    if (params.candidateId) {
      filters.push(eq(candidateVacancies.candidateId, params.candidateId));
    }

    if (params.vacancyId) {
      filters.push(eq(candidateVacancies.vacancyId, params.vacancyId));
    }

    if (params.candidateVacancyStatusId) {
      filters.push(
        eq(
          candidateVacancies.candidateVacancyStatusId,
          params.candidateVacancyStatusId,
        ),
      );
    }

    if (params.notes) {
      filters.push(ilike(candidateVacancies.notes, params.notes));
    }

    return filters.length > 0 ? and(...filters) : undefined;
  }
}
