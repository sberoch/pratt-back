import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationParams } from '../common/pagination/pagination.params';

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

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provinces?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
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
  companyId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  createdById?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  assignedToId?: number;

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterSeniorityIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterAreaIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterIndustryIds?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  filterMinStars?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filterGender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filterMinAge?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filterMaxAge?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterCountries?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterProvinces?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  filterLanguages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
