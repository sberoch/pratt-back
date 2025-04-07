import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, not, SQL } from 'drizzle-orm';
import {
  users,
  User,
  hashPassword,
  excludePassword,
} from '../common/database/schemas/user.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import { CreateUserDto, UpdateUserDto, UserQueryParams } from './user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: UserQueryParams,
  ): Promise<PaginatedResponse<Omit<User, 'password'>>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.users.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
    });

    const countQuery = this.db
      .select({ count: count(users.id) })
      .from(users)
      .where(whereClause);

    let [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);

    items = items.map((user) => {
      return excludePassword(user);
    });

    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    let user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) throw new NotFoundException('Not found');
    user = excludePassword(user);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) throw new NotFoundException('Not found');
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await hashPassword(createUserDto.password);
    let [user] = await this.db.insert(users).values(createUserDto).returning();
    user = excludePassword(user);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }
    let [user] = await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException('Not found');
    user = excludePassword(user);
    return user;
  }

  async remove(id: number) {
    let [user] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException('Not found');
    user = excludePassword(user);
    return user;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private buildOrderBy(params: UserQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = users[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(params: UserQueryParams) {
    const filters: SQL[] = [];
    if (params.email) {
      filters.push(ilike(users.email, `%${params.email}%`));
    }
    if (params.active !== undefined) {
      filters.push(eq(users.active, params.active));
    }
    if (params.role) {
      filters.push(eq(users.role, params.role));
    }
    if (params.excludeRole) {
      filters.push(not(eq(users.role, params.excludeRole)));
    }
    return filters.length > 0 ? and(...filters) : undefined;
  }
}
