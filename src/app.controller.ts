import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DrizzleProvider } from './common/database/drizzle.module';
import { DrizzleDatabase } from './common/database/types/drizzle';
import { Public } from './auth/auth.decorators';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(@Inject(DrizzleProvider) private readonly db: DrizzleDatabase) {}

  @Public()
  @Get('/health')
  async healthCheck() {
    try {
      await this.db.query.candidates.findFirst();

      return {
        status: 'healthy',
        api: { status: 'up' },
        database: { status: 'up' },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        api: { status: 'up' },
        database: {
          status: 'down',
          error: error?.message,
        },
      };
    }
  }
}
