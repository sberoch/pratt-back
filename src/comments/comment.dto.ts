import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  candidateId: number;

  @ApiProperty({ example: 'This is a comment' })
  @IsString()
  comment: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
export class DeleteCommentDto {
  @ApiProperty({ example: 1 })
  userId: number;
}

export class CommentQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 1, required: false })
  candidateId?: number;

  @ApiProperty({ example: 'This is a comment', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ example: 1, required: false })
  userId?: number;
}
