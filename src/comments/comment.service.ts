import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, like, SQL } from 'drizzle-orm';
import { Comment, comments } from '../common/database/schemas/comment.schema';
import { DrizzleProvider } from '../common/database/drizzle.module';
import { DrizzleDatabase } from '../common/database/types/drizzle';
import { PaginatedResponse } from '../common/pagination/pagination.params';
import {
  buildPaginationQuery,
  paginatedResponse,
} from '../common/pagination/pagination.utils';
import {
  CommentQueryParams,
  CreateCommentDto,
  DeleteCommentDto,
  UpdateCommentDto,
} from './comment.dto';
import { Candidate } from '../common/database/schemas/candidate.schema';

export type CommentApiResponse = Comment & {
  candidate: Candidate;
};

@Injectable()
export class CommentService {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  async findAll(
    params: CommentQueryParams,
  ): Promise<PaginatedResponse<CommentApiResponse>> {
    const paginationQuery = buildPaginationQuery(params);
    const whereClause = this.buildWhereClause(params);
    const orderClause = this.buildOrderBy(params);

    const itemsQuery = this.db.query.comments.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: paginationQuery.limit,
      offset: paginationQuery.offset,
      with: {
        candidate: true,
      },
    });

    const countQuery = this.db
      .select({ count: count(comments.id) })
      .from(comments)
      .where(whereClause);

    const [items, [{ count: totalItems }]] = await Promise.all([
      itemsQuery,
      countQuery,
    ]);
    return paginatedResponse(items, totalItems, paginationQuery);
  }

  async findOne(id: number) {
    const comment = await this.db.query.comments.findFirst({
      where: eq(comments.id, id),
    });
    if (!comment) throw new NotFoundException('Not found');
    return comment;
  }

  async create(createCommentDto: CreateCommentDto) {
    const [comment] = await this.db
      .insert(comments)
      .values(createCommentDto)
      .returning();
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const existingComment = await this.findOne(id);
    if (!existingComment) throw new NotFoundException('Not found');

    if (existingComment.userId !== updateCommentDto.userId) {
      throw new BadRequestException('User ID mismatch');
    }

    const createdAt = new Date(existingComment.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      throw new BadRequestException('Comment is older than 1 day');
    }

    const [comment] = await this.db
      .update(comments)
      .set(updateCommentDto)
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async remove(id: number, deleteCommentDto: DeleteCommentDto) {
    const existingComment = await this.findOne(id);
    if (!existingComment) throw new NotFoundException('Not found');

    if (existingComment.userId !== deleteCommentDto.userId) {
      throw new BadRequestException('User ID mismatch');
    }

    const [comment] = await this.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  /**
   * Helper methods for query building
   * These methods handle filtering, ordering, and pagination of post queries
   */
  private buildOrderBy(params: CommentQueryParams): SQL[] {
    const [sortBy, sortOrderString] = params.order?.split(':') || ['id', 'asc'];
    const sortOrder = sortOrderString?.toLowerCase() === 'desc' ? desc : asc;
    // Basic safety check: ensure sortBy is a valid column key
    const column = comments[sortBy];
    if (column) {
      return [sortOrder(column)];
    }
    throw new BadRequestException('Invalid sortBy parameter');
  }

  private buildWhereClause(query: CommentQueryParams) {
    const filters: SQL[] = [];
    if (query.id) {
      filters.push(eq(comments.id, query.id));
    }
    if (query.candidateId) {
      filters.push(eq(comments.candidateId, query.candidateId));
    }
    if (query.comment) {
      filters.push(like(comments.comment, `%${query.comment}%`));
    }
    if (query.userId) {
      filters.push(eq(comments.userId, query.userId));
    }
    return filters.length > 0 ? and(...filters) : undefined;
  }
}
