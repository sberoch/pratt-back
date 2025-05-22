import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCandidateVacancyStatusDto {
  @ApiProperty({ example: 'Under review' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @IsOptional()
  sort: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isInitial: boolean;
}

export class UpdateCandidateVacancyStatusDto extends PartialType(
  CreateCandidateVacancyStatusDto,
) {}

export class CandidateVacancyStatusQueryParams extends PaginationParams {}
