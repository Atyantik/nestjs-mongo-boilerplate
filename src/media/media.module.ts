import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import * as aws from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { mediaShortId } from '@utils/string';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media, MediaSchema } from './entities/media.entity';

@Module({
  imports: [
    /**
     * File upload
     */
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const endpoint = configService.get('app.media.endpoint');
        const secretAccessKey = configService.get('app.media.secretAccessKey');
        const accessKeyId = configService.get('app.media.accessKeyId');
        const bucket = configService.get('app.media.bucket');
        const appEnv = configService.get('app.env');
        const s3 = new aws.S3({
          endpoint,
          secretAccessKey,
          accessKeyId,
        });
        return {
          limits: {
            fileSize: 94371840,
          },
          storage: multerS3({
            bucket,
            s3: s3,
            cacheControl: 'max-age=31536000',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
              file.shortId = mediaShortId();
              const fileName = `${appEnv}/${file.shortId}-${file.originalname}`;
              cb(null, fileName);
            },
          }),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: Media.name,
        schema: MediaSchema,
      },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
