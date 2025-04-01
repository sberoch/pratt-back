import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import {
  IsArray,
  IsBooleanString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'This is a short description' })
  @IsString()
  @IsOptional()
  shortDescription: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'https://linkedin.com/in/johndoe' })
  @IsString()
  @IsOptional()
  linkedin: string;

  @ApiProperty({ example: 'Street 1234' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ example: '40000000' })
  @IsString()
  @IsOptional()
  documentNumber: string;

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
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}

export class CandidateQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 'John', required: false })
  name?: string;

  @ApiProperty({ example: 18, required: false })
  minimumAge?: number;

  @ApiProperty({ example: 30, required: false })
  maximumAge?: number;

  @ApiProperty({ example: 'Male', required: false })
  gender?: string;

  @ApiProperty({ example: 'This is a short description', required: false })
  shortDescription?: string;

  @ApiProperty({ example: 'johndoe@gmail.com', required: false })
  email?: string;

  @ApiProperty({ example: 'https://linkedin.com/in/johndoe', required: false })
  linkedin?: string;

  @ApiProperty({ example: 'Street 1234', required: false })
  address?: string;

  @ApiProperty({ example: '40000000', required: false })
  documentNumber?: string;

  @ApiProperty({ example: '1512345678', required: false })
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  sourceId?: number;

  @ApiProperty({ example: [1], required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  seniorityIds?: number[];

  @ApiProperty({ example: [1], required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  areaIds?: number[];

  @ApiProperty({ example: [1], required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  industryIds?: number[];

  @ApiProperty({ example: [1], required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  fileIds?: number[];

  @ApiProperty({ example: 3.4, required: false })
  minimumStars?: number;

  @ApiProperty({ example: 3.4, required: false })
  maximumStars?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBooleanString()
  blacklisted?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBooleanString()
  deleted?: boolean;
}
