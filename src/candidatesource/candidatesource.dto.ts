import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateCandidateSourceDto {
  @ApiProperty({ example: 'Linkedin' })
  @IsString()
  name: string;
}

export class UpdateCandidateSourceDto extends PartialType(
  CreateCandidateSourceDto,
) {}

export class CandidateSourceQueryParams extends PaginationParams {}
