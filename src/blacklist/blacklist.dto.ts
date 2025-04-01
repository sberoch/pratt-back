import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBlacklistDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  candidateId: number;

  @ApiProperty({ example: 'This is a reason' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;
}

export class UpdateBlacklistDto extends PartialType(CreateBlacklistDto) {}

export class BlacklistQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 1, required: false })
  candidateId?: number;

  @ApiProperty({ example: 'This is a reason', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: 1, required: false })
  userId?: number;
}
