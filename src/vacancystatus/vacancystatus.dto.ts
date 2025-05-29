import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateVacancyStatusDto {
  @ApiProperty({ example: 'Abierta' })
  @IsString()
  name: string;
}

export class UpdateVacancyStatusDto extends PartialType(
  CreateVacancyStatusDto,
) {}

export class VacancyStatusQueryParams extends PaginationParams {}
