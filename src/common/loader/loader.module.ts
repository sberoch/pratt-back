import { Module } from '@nestjs/common';
import { LoaderService } from './loader.service';

@Module({
  providers: [LoaderService],
})
export class LoaderModule {}
