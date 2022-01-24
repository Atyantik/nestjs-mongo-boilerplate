import { Module, CacheModule as NestCacheModule, Global } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as mongooseStore from '../common/cache/mongoose-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync<any>({
      isGlobal: true,
      useFactory: async (mongooseCacheConnection: mongoose.Connection) => {
        return {
          store: mongooseStore,
          modelName: 'CacheManager', // model name in mongoose registry
          mongoose: mongoose,
          // options for model creation
          modelOptions: {
            collection: 'cacheManager', // mongodb collection name
            versionKey: false, // do not create __v field
          },
          ttl: 0, // time to live unlimited (default is 1 minute),
          connection: mongooseCacheConnection,
        };
      },
      inject: [getConnectionToken()],
    }),
  ],
  controllers: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
