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
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  filterMinStars?: number;

  @ApiProperty({ required: false, example: 'Male' })
  @IsOptional()
  @IsString()
  filterGender?: string;

  @ApiProperty({ required: false, example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filterMinAge?: number;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filterMaxAge?: number;
}
