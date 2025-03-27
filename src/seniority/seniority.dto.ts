import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateSeniorityDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;
}

export class UpdateSeniorityDto extends PartialType(CreateSeniorityDto) {}

export class SeniorityQueryParams extends PaginationParams {}
