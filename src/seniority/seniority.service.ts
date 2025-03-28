import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import {
  seniorities,
  Seniority,
} from 'src/common/database/schemas/seniority.schema';
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
  CreateSeniorityDto,
  SeniorityQueryParams,
  UpdateSeniorityDto,
} from './seniority.dto';

@Injectable()
export class SeniorityService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: SeniorityQueryParams,
  ): Promise<PaginatedResponse<Seniority>> {
    const paginationQuery = buildPaginationQuery(params);
    let itemsQuery = this.db.select().from(seniorities).$dynamic();
    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(seniorities);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const seniority = await this.db.query.seniorities.findFirst({
      where: eq(seniorities.id, id),
    });
    if (!seniority) throw new NotFoundException('Not found');
    return seniority;
  }

  async create(createSeniorityDto: CreateSeniorityDto) {
    const [seniority] = await this.db
      .insert(seniorities)
      .values(createSeniorityDto)
      .returning();
    return seniority;
  }

  async update(id: number, updateSeniorityDto: UpdateSeniorityDto) {
    const [seniority] = await this.db
      .update(seniorities)
      .set(updateSeniorityDto)
      .where(eq(seniorities.id, id))
      .returning();
    return seniority;
  }

  async remove(id: number) {
    const [seniority] = await this.db
      .delete(seniorities)
      .where(eq(seniorities.id, id))
      .returning();
    return seniority;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(seniorities[query.order.key])
        : desc(seniorities[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: SeniorityQueryParams) {
    const filters: SQL[] = [];
    return qb.where(and(...filters));
  }
}
