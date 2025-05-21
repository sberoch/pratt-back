import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
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

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  assignedTo: number;
}

export class UpdateVacancyDto extends PartialType(CreateVacancyDto) {}

export class VacancyQueryParams extends PaginationParams {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  statusId?: number;

  @ApiProperty({ required: false })
  filters?: VacancyFiltersDto;

  @ApiProperty({ required: false })
  companyId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  createdBy?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  assignedTo?: number;
}
