import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Apple is an American multinational technology company',
  })
  @IsString()
  description: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export class CompanyQueryParams extends PaginationParams {
  @ApiProperty({ example: 1, required: false })
  id?: number;

  @ApiProperty({ example: 'Apple', required: false })
  name?: string;

  @ApiProperty({
    example: 'Apple is an American multinational technology company',
    required: false,
  })
  description?: string;
}
