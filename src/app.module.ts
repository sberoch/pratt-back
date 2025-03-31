import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { LoaderModule } from './common/loader/loader.module';
import { DrizzleModule } from './common/database/drizzle.module';
import { CandidateModule } from './candidate/candidate.module';
import { ConfigModule } from '@nestjs/config';
import { SeniorityModule } from './seniority/seniority.module';
import { AreaModule } from './area/area.module';
import { IndustryModule } from './industry/industry.module';
import { CandidateFileModule } from './candidatefile/candidatefile.module';
import { CandidateSourceModule } from './candidatesource/candidatesource.module';
import { CommentModule } from './comments/comment.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoaderModule,
    DrizzleModule,
    CandidateModule,
    SeniorityModule,
    AreaModule,
    IndustryModule,
    CandidateFileModule,
    CandidateSourceModule,
    CommentModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
