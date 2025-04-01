import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { DrizzleProvider } from './common/database/drizzle.module';
import { DrizzleDatabase } from './common/database/types/drizzle';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  @Get('/ping')
  async ping() {
    return { status: 'OK' };
  }

  @Get('/test')
  async test() {
    return this.db.query.candidates.findMany();
  }

  @Post('/populate-database')
  async populateDatabase() {
    return { status: 'Database populated' };
  }
}
