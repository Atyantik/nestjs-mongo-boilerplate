import * as path from 'path';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { MediaModule } from './media/media.module';
import { configValidator } from './config/env.validation';
import { appConfig } from './config/app.config';
import { MailerModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
    /**
     * Config module for loading configurations from
     * .env file and app config files, along with validations
     */
    ConfigModule.forRoot({
      validationSchema: configValidator,
      load: [appConfig],
    }),
    /**
     * Mongoose module for default DB connectivity
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get('app.mongodbConnectionString'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CacheModule,
    MailerModule,
    /**
     * Custom modules for the application
     */
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
