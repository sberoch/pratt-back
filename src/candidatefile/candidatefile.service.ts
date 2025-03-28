import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import {
  CandidateFile,
  candidateFiles,
} from 'src/common/database/schemas/candidatefile.schema';
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
  CandidateFileQueryParams,
  CreateCandidateFileDto,
  UpdateCandidateFileDto,
} from './candidatefile.dto';

@Injectable()
export class CandidateFileService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CandidateFileQueryParams,
  ): Promise<PaginatedResponse<CandidateFile>> {
    const paginationQuery = buildPaginationQuery(params);
    let itemsQuery = this.db.select().from(candidateFiles).$dynamic();
    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(candidateFiles);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const candidatefile = await this.db.query.candidateFiles.findFirst({
      where: eq(candidateFiles.id, id),
    });
    if (!candidatefile) throw new NotFoundException('Not found');
    return candidatefile;
  }

  async create(createCandidateFileDto: CreateCandidateFileDto) {
    const [candidatefile] = await this.db
      .insert(candidateFiles)
      .values(createCandidateFileDto)
      .returning();
    return candidatefile;
  }

  async update(id: number, updateCandidateFileDto: UpdateCandidateFileDto) {
    const [candidatefile] = await this.db
      .update(candidateFiles)
      .set(updateCandidateFileDto)
      .where(eq(candidateFiles.id, id))
      .returning();
    return candidatefile;
  }

  async remove(id: number) {
    const [candidatefile] = await this.db
      .delete(candidateFiles)
      .where(eq(candidateFiles.id, id))
      .returning();
    return candidatefile;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(candidateFiles[query.order.key])
        : desc(candidateFiles[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: CandidateFileQueryParams) {
    const filters: SQL[] = [];
    return qb.where(and(...filters));
  }
}
