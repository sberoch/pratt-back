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
import { CommentModule } from './comment/comment.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { SeedModule } from './seed/seed.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { ClsModule } from 'nestjs-cls';
import { CompanyModule } from './company/company.module';
import { CandidateVacancyStatusModule } from './candidatevacancystatus/candidatevacancystatus.module';
import { VacancyStatusModule } from './vacancystatus/vacancystatus.module';
import { VacancyModule } from './vacancy/vacancy.module';

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
    BlacklistModule,
    CompanyModule,
    CandidateVacancyStatusModule,
    VacancyStatusModule,
    VacancyModule,
    SeedModule,
    UserModule,
    AuthModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
