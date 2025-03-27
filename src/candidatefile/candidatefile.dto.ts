import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateCandidateFileDto {
  @ApiProperty({ example: 'googlefile' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://google.com' })
  @IsString()
  url: string;
}

export class UpdateCandidateFileDto extends PartialType(
  CreateCandidateFileDto,
) {}

export class CandidateFileQueryParams extends PaginationParams {}
