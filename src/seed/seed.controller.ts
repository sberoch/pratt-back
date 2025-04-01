import { Controller, Delete, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seeds')
@Controller('seed')
export class CommentController {
  constructor(private readonly seedService: SeedService) {}

  @ApiCreatedResponse()
  @Post()
  async create() {
    return this.seedService.populateDatabase();
  }

  @ApiOkResponse()
  @Delete()
  async remove() {
    return this.seedService.resetDatabase();
  }
}
