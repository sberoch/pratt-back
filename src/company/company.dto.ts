import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyStatus } from './company.status';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Apple is an American multinational technology company',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: CompanyStatus.ACTIVO })
  @IsNotEmpty()
  @IsEnum(CompanyStatus)
  status: CompanyStatus;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class CompanyQueryParams extends PaginationParams {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({
    required: false,
  })
  description?: string;

  @ApiProperty({ required: false, enum: CompanyStatus })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}
