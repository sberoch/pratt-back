import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, like, SQL } from 'drizzle-orm';
import {
  Blacklist,
  blacklists,
} from '../common/database/schemas/blacklist.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  BlacklistQueryParams,
  CreateBlacklistDto,
  UpdateBlacklistDto,
} from './blacklist.dto';
import { Candidate } from '../common/database/schemas/candidate.schema';
import { excludePassword } from '../common/database/schemas/user.schema';

export type BlacklistApiResponse = Blacklist & {
  candidate: Candidate;
};

@Injectable()
export class BlacklistService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: BlacklistQueryParams,
  ): Promise<PaginatedResponse<BlacklistApiResponse>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    let itemsQuery = this.db.query.blacklists.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
      with: {
        candidate: true,
        user: true,
      },
    });

    const countQuery = this.db
      .select({ count: count(blacklists.id) })
      .from(blacklists)
      .where(whereClause);

    let [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);

    items = items.map((blacklist) => {
      blacklist.user = excludePassword(blacklist.user);
      return blacklist;
    });

    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const blacklist = await this.db.query.blacklists.findFirst({
      where: eq(blacklists.id, id),
    });
    if (!blacklist) throw new NotFoundException('Not found');
    return blacklist;
  }

  async create(createBlacklistDto: CreateBlacklistDto) {
    const existingBlacklist = await this.db.query.blacklists.findFirst({
      where: eq(blacklists.candidateId, createBlacklistDto.candidateId),
    });
    if (existingBlacklist) {
      throw new BadRequestException('Candidate already blacklisted');
    }

    const [blacklist] = await this.db
      .insert(blacklists)
      .values(createBlacklistDto)
      .returning();
    return blacklist;
  }

  async update(id: number, updateBlacklistDto: UpdateBlacklistDto) {
    const [blacklist] = await this.db
      .update(blacklists)
      .set(updateBlacklistDto)
      .where(eq(blacklists.id, id))
      .returning();
    return blacklist;
  }

  async remove(id: number) {
    const [blacklist] = await this.db
      .delete(blacklists)
      .where(eq(blacklists.id, id))
      .returning();
    return blacklist;
  }

  async removeByCandidateId(candidateId: number) {
    const [blacklist] = await this.db
      .delete(blacklists)
      .where(eq(blacklists.candidateId, candidateId))
      .returning();
    return blacklist;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private buildOrderBy(params: BlacklistQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = blacklists[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(query: BlacklistQueryParams) {
    const filters: SQL[] = [];
    if (query.id) {
      filters.push(eq(blacklists.id, query.id));
    }
    if (query.candidateId) {
      filters.push(eq(blacklists.candidateId, query.candidateId));
    }
    if (query.reason) {
      filters.push(like(blacklists.reason, `%${query.reason}%`));
    }
    if (query.userId) {
      filters.push(eq(blacklists.userId, query.userId));
    }
    return filters.length > 0 ? and(...filters) : undefined;
  }
}
