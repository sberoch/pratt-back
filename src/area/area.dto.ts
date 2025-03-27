import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationParams } from '../common/pagination/pagination.params';
import { IsString } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  name: string;
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}

export class AreaQueryParams extends PaginationParams {}
