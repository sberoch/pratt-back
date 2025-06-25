import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateVacancyDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  candidateId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  vacancyId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  candidateVacancyStatusId: number;

  @ApiProperty({})
  @IsString()
  notes: string;
}

export class UpdateCandidateVacancyDto extends PartialType(
  CreateCandidateVacancyDto,
) {}

export class CandidateVacancyQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 1, required: false })
  candidateId?: number;

  @ApiProperty({ example: [1, 2, 3], required: false, type: [Number] })
  @Transform(({ value }) => {
    if (!value) return value;
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v.toString(), 10));
    }
    return [parseInt(value.toString(), 10)];
  })
  candidateIds?: number[];

  @ApiProperty({ example: 1, required: false })
  vacancyId?: number;

  @ApiProperty({ example: 1, required: false })
  candidateVacancyStatusId?: number;

  @ApiProperty({ required: false })
  notes?: string;
}
