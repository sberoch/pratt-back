import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import {
  industries,
  Industry,
} from 'src/common/database/schemas/industry.schema';
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
  CreateIndustryDto,
  IndustryQueryParams,
  UpdateIndustryDto,
} from './industry.dto';

@Injectable()
export class IndustryService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: IndustryQueryParams,
  ): Promise<PaginatedResponse<Industry>> {
    const paginationQuery = buildPaginationQuery(params);
    let itemsQuery = this.db.select().from(industries).$dynamic();
    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(industries);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const industry = await this.db.query.industries.findFirst({
      where: eq(industries.id, id),
    });
    if (!industry) throw new NotFoundException('Not found');
    return industry;
  }

  async create(createIndustryDto: CreateIndustryDto) {
    const [industry] = await this.db
      .insert(industries)
      .values(createIndustryDto)
      .returning();
    return industry;
  }

  async update(id: number, updateIndustryDto: UpdateIndustryDto) {
    const [industry] = await this.db
      .update(industries)
      .set(updateIndustryDto)
      .where(eq(industries.id, id))
      .returning();
    return industry;
  }

  async remove(id: number) {
    const [industry] = await this.db
      .delete(industries)
      .where(eq(industries.id, id))
      .returning();
    return industry;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(industries[query.order.key])
        : desc(industries[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: IndustryQueryParams) {
    const filters: SQL[] = [];
    return qb.where(and(...filters));
  }
}
