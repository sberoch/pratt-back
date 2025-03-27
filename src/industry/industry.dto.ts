import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;
}

export class UpdateIndustryDto extends PartialType(CreateIndustryDto) {}

export class IndustryQueryParams extends PaginationParams {}
