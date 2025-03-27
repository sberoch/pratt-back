import { ApiProperty } from '@nestjs/swagger';

export class PaginationParams {
  @ApiProperty({ required: false, example: 1 })
  page?: number;

  @ApiProperty({ required: false, example: 10 })
  limit?: number;

  @ApiProperty({ required: false, example: 'id:asc' })
  order?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
