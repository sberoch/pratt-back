import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import {
  CandidateSource,
  candidateSources,
} from 'src/common/database/schemas/candidatesource.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
  PaginationQuery,
  withPagination,
} from '../common/pagination/pagination.utils';
import {
  CandidateSourceQueryParams,
  CreateCandidateSourceDto,
  UpdateCandidateSourceDto,
} from './candidatesource.dto';

@Injectable()
export class CandidateSourceService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateSourceQueryParams,
  ): Promise<PaginatedResponse<CandidateSource>> {
    const paginationQuery = buildPaginationQuery(params);
    let itemsQuery = this.db.select().from(candidateSources).$dynamic();
    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(candidateSources);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidateSource = await this.db.query.candidateSources.findFirst({
      where: eq(candidateSources.id, id),
    });
    if (!candidateSource) throw new NotFoundException('Not found');
    return candidateSource;
  }

  async create(createCandidateSourceDto: CreateCandidateSourceDto) {
    const [candidateSource] = await this.db
      .insert(candidateSources)
      .values(createCandidateSourceDto)
      .returning();
    return candidateSource;
  }

  async update(id: number, updateCandidateSourceDto: UpdateCandidateSourceDto) {
    const [candidateSource] = await this.db
      .update(candidateSources)
      .set(updateCandidateSourceDto)
      .where(eq(candidateSources.id, id))
      .returning();
    return candidateSource;
  }

  async remove(id: number) {
    const [candidateSource] = await this.db
      .delete(candidateSources)
      .where(eq(candidateSources.id, id))
      .returning();
    return candidateSource;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(candidateSources[query.order.key])
        : desc(candidateSources[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: CandidateSourceQueryParams) {
    const filters: SQL[] = [];
    return qb.where(and(...filters));
  }
}
