import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ReturnDataInterceptor } from './common/interceptor/return-data.interceptor';
import { ReturnMediaInterceptor } from './common/interceptor/return-media.interceptor';
import { CacheService } from './cache/cache.service';

@Controller()
@ApiTags('General')
@UseInterceptors(new ReturnDataInterceptor())
@UseInterceptors(new ReturnMediaInterceptor())
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  defaultHtml(): string {
    return this.appService.getHomePage();
  }
}
