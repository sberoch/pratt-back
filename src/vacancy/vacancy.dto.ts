import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class VacancyFiltersDto {
  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  seniorityIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  areaIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  industryIds?: number[];

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  minStars?: number;

  @ApiProperty({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 18 })
  @IsOptional()
  @IsInt()
  minAge?: number;

  @ApiProperty({ example: 30 })
  @IsOptional()
  @IsInt()
  maxAge?: number;
}

export class CreateVacancyDto {
  @ApiProperty({ example: 'Frontend Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Se busca desarrollador frontend' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  statusId: number;

  @ApiProperty({})
  filters: VacancyFiltersDto;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  companyId: number;
}

export class UpdateVacancyDto extends PartialType(CreateVacancyDto) {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  id?: number;
}

export class VacancyQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 'Frontend Developer', required: false })
  title?: string;

  @ApiProperty({ example: 'Se busca desarrollador frontend', required: false })
  description?: string;

  @ApiProperty({ example: 1, required: false })
  statusId?: number;

  @ApiProperty({ required: false })
  filters?: VacancyFiltersDto;

  @ApiProperty({ example: 1, required: false })
  companyId?: number;
}
