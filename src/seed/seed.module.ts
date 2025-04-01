import { Module } from '@nestjs/common';
import { CommentController } from './seed.controller';
import { SeedService } from './seed.service';
import { DrizzleModule } from '../common/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [CommentController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
