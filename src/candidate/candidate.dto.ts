import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsString()
  @IsOptional()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({ example: 'This is a short description' })
  @IsString()
  @IsOptional()
  shortDescription: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
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
  @IsOptional()
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

  @ApiProperty({ example: false })
  @IsBoolean()
  blacklisted: boolean;
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}

export class CandidateQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 'John', required: false })
  name?: string;

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

  @ApiProperty({ example: [1], required: false })
  @IsArray()
  @IsOptional()
  seniorityIds?: number[];

  @ApiProperty({ example: [1], required: false })
  @IsArray()
  @IsOptional()
  areaIds?: number[];

  @ApiProperty({ example: [1], required: false })
  @IsArray()
  @IsOptional()
  industryIds?: number[];

  @ApiProperty({ example: [1], required: false })
  @IsArray()
  @IsOptional()
  fileIds?: number[];

  @ApiProperty({ example: 3.4, required: false })
  minimumStars?: number;

  @ApiProperty({ example: 3.4, required: false })
  maximumStars?: number;

  @ApiProperty({ example: false, required: false })
  blacklisted?: boolean;

  @ApiProperty({ example: false, required: false })
  deleted?: boolean;
}
