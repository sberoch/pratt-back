import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class LoaderService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log('Application started.');
  }
}
