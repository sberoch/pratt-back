import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateCandidateVacancyStatusDto {
  @ApiProperty({ example: 'Under review' })
  @IsString()
  name: string;
}

export class UpdateCandidateVacancyStatusDto extends PartialType(
  CreateCandidateVacancyStatusDto,
) {}

export class CandidateVacancyStatusQueryParams extends PaginationParams {}
