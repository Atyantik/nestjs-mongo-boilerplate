import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  get(key: string) {
    return this.cacheManager.get(key);
  }

  // ttl is in seconds
  set(key: string, data: any, options?: { ttl: number /* seconds */ }) {
    return this.cacheManager.set(key, data, options);
  }

  del(key: string) {
    return this.cacheManager.del(key);
  }
}
