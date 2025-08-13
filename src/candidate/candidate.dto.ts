import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationParams } from '../common/pagination/pagination.params';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'This is a short description' })
  @IsOptional()
  @IsString()
  shortDescription: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedin: string;

  @ApiProperty({ example: 'Street 1234' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: '1512345678' })
  @IsOptional()
  phone: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  sourceId: number;

  @ApiProperty({ example: [1], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  seniorityIds: number[];

  @ApiProperty({ example: [1], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  areaIds: number[];

  @ApiProperty({ example: [1], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  industryIds: number[];

  @ApiProperty({ example: [1], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  fileIds: number[];

  @ApiProperty({ example: 3.4 })
  @IsNumber()
  stars: number;

  @ApiProperty({})
  @IsBoolean()
  isInCompanyViaPratt: boolean;

  @ApiProperty({ example: ['Argentina', 'Chile'] })
  @IsArray()
  @IsString({ each: true })
  countries: string[];

  @ApiProperty({ example: ['Buenos Aires', 'Córdoba'] })
  @IsArray()
  @IsString({ each: true })
  provinces: string[];

  @ApiProperty({ example: ['Español', 'Inglés'] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}

export class CandidateQueryParams extends PaginationParams {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  minimumAge?: number;

  @ApiProperty({ required: false })
  maximumAge?: number;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  linkedin?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  countries?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  provinces?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  languages?: string[];

  @ApiProperty({ required: false })
  sourceId?: number;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  seniorityIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  areaIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  industryIds?: number[];

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  fileIds?: number[];

  @ApiProperty({ required: false })
  minimumStars?: number;

  @ApiProperty({ required: false })
  maximumStars?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  blacklisted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  deleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  isInCompanyViaPratt?: boolean;
}
