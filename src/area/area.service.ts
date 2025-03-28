import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { Area, areas } from 'src/common/database/schemas/area.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
  PaginationQuery,
  withPagination,
} from '../common/pagination/pagination.utils';
import { AreaQueryParams, CreateAreaDto, UpdateAreaDto } from './area.dto';

@Injectable()
export class AreaService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(params: AreaQueryParams): Promise<PaginatedResponse<Area>> {
    const paginationQuery = buildPaginationQuery(params);
    let itemsQuery = this.db.select().from(areas).$dynamic();
    itemsQuery = this.withFilters(itemsQuery, params);
    itemsQuery = this.withOrder(itemsQuery, paginationQuery);
    itemsQuery = withPagination(itemsQuery, paginationQuery);

    let countQuery = this.db.select({ count: count() }).from(areas);
    countQuery = this.withFilters(countQuery, params);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const area = await this.db.query.areas.findFirst({
      where: eq(areas.id, id),
    });
    if (!area) throw new NotFoundException('Not found');
    return area;
  }

  async create(createAreaDto: CreateAreaDto) {
    const [area] = await this.db
      .insert(areas)
      .values(createAreaDto)
      .returning();
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const [area] = await this.db
      .update(areas)
      .set(updateAreaDto)
      .where(eq(areas.id, id))
      .returning();
    return area;
  }

  async remove(id: number) {
    const [area] = await this.db
      .delete(areas)
      .where(eq(areas.id, id))
      .returning();
    return area;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private withOrder(qb: any, query: PaginationQuery) {
    const orderBy =
      query.order.direction === 'asc'
        ? asc(areas[query.order.key])
        : desc(areas[query.order.key]);
    return qb.orderBy(orderBy);
  }

  private withFilters(qb: any, query: AreaQueryParams) {
    const filters: SQL[] = [];
    return qb.where(and(...filters));
  }
}
