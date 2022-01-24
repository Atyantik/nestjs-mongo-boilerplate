import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaDto } from './dto/create-media.dto';
import { PartialUpdateMediaDto } from './dto/partial-update-media.dto';
import { Media } from './entities/media.entity';
import { MongoService } from '../common/service/mongo.service';

@Injectable()
export class MediaService extends MongoService<
  Media,
  CreateMediaDto,
  any,
  PartialUpdateMediaDto
> {
  constructor(@InjectModel(Media.name) protected readonly model: Model<Media>) {
    super();
  }

  async saveMultipleMedia({
    resourceId,
    resourceType,
    tags,
    attributes,
    files,
  }): Promise<any> {
    const savedFilesPromises = [];
    files.forEach((file) => {
      savedFilesPromises.push(
        this.create({
          ...file,
          resourceType,
          resourceId,
          tags,
          attributes,
          uniqueId: file?.shortId,
        }),
      );
    });
    const savedFiles = await Promise.all(savedFilesPromises);
    return savedFiles;
  }

  async removeMediaByUniqueId(uniqueId: string) {
    const removedMedia = await this.removeByUniqueId(uniqueId);
    return removedMedia;
  }
}
