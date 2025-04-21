import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import {
  candidateVacancyStatuses,
  CandidateVacancyStatus,
} from '../common/database/schemas/candidatevacancystatus.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  CreateCandidateVacancyStatusDto,
  CandidateVacancyStatusQueryParams,
  UpdateCandidateVacancyStatusDto,
} from './candidatevacancystatus.dto';

@Injectable()
export class CandidateVacancyStatusService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateVacancyStatusQueryParams,
  ): Promise<PaginatedResponse<CandidateVacancyStatus>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.candidateVacancyStatuses.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
    });

    const countQuery = this.db
      .select({ count: count(candidateVacancyStatuses.id) })
      .from(candidateVacancyStatuses)
      .where(whereClause);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidateVacancyStatus =
      await this.db.query.candidateVacancyStatuses.findFirst({
        where: eq(candidateVacancyStatuses.id, id),
      });
    if (!candidateVacancyStatus) throw new NotFoundException('Not found');
    return candidateVacancyStatus;
  }

  async create(
    createCandidateVacancyStatusDto: CreateCandidateVacancyStatusDto,
  ) {
    const [candidateVacancyStatus] = await this.db
      .insert(candidateVacancyStatuses)
      .values(createCandidateVacancyStatusDto)
      .returning();
    return candidateVacancyStatus;
  }

  async update(
    id: number,
    updateCandidateVacancyStatusDto: UpdateCandidateVacancyStatusDto,
  ) {
    const [candidateVacancyStatus] = await this.db
      .update(candidateVacancyStatuses)
      .set(updateCandidateVacancyStatusDto)
      .where(eq(candidateVacancyStatuses.id, id))
      .returning();
    return candidateVacancyStatus;
  }

  async remove(id: number) {
    const [candidateVacancyStatus] = await this.db
      .delete(candidateVacancyStatuses)
      .where(eq(candidateVacancyStatuses.id, id))
      .returning();
    return candidateVacancyStatus;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private buildOrderBy(params: CandidateVacancyStatusQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = candidateVacancyStatuses[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(params: CandidateVacancyStatusQueryParams) {
    const filters: SQL[] = [];
    return filters.length > 0 ? and(...filters) : undefined;
  }
}
