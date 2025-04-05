import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UserRole } from '../user/user.roles';
import { Roles } from '../auth/roles/roles.decorator';
import { Public } from '../auth/auth.decorators';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('Seeds')
@Controller('seed')
export class CommentController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @ApiCreatedResponse()
  @Post()
  async create() {
    return this.seedService.populateDatabase();
  }

  @Roles(UserRole.ADMIN)
  @ApiOkResponse()
  @Delete()
  async remove() {
    return this.seedService.resetDatabase();
  }
}
