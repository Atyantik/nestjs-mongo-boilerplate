import {
  Body,
  Controller,
  Delete,
  Param,
  Get,
  Patch,
  Post,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard, RoleGuard, Roles } from 'nest-keycloak-connect';
import { ApiConsumes, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnDataInterceptor } from '../common/interceptor/return-data.interceptor';
import { ReturnMediaInterceptor } from '../common/interceptor/return-media.interceptor';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { PartialUpdateMediaDto } from './dto/partial-update-media.dto';
import { MediaResourceInterceptor } from './media.resource.interceptor';

@Controller('media')
@ApiTags('Media')
@UseInterceptors(new ReturnDataInterceptor())
@UseInterceptors(new ReturnMediaInterceptor({ isMediaArray: true }))
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  @Roles({ roles: ['admin', 'consultant'] })
  async findOne(@Param('id') id: string) {
    const media = await this.mediaService.findOneByUniqueId(id);
    if (!media) {
      throw new NotFoundException(`Cannot find media with id: ${id}`);
    }
    return media;
  }

  @Patch(':id')
  @Roles({ roles: ['admin', 'consultant'] })
  async partialUpdate(
    @Param('id') id: string,
    @Body() body: PartialUpdateMediaDto,
  ) {
    const media = await this.mediaService.partialUpdateByUniqueId(id, body);
    if (!media) {
      throw new NotFoundException(`Cannot find media with id: ${id}`);
    }
    return media;
  }

  @Delete(':id')
  @Roles({ roles: ['admin', 'consultant'] })
  async remove(@Param('id') id: string) {
    const removedMedia = await this.mediaService.removeMediaByUniqueId(id);
    if (removedMedia) {
      return;
    }
    throw new NotFoundException(`Cannot find media with id: ${id}`);
  }

  @Post('images')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(MediaResourceInterceptor)
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      fileFilter(req, file, cb) {
        if (file?.mimetype?.indexOf?.('image') === -1) {
          return cb(
            new BadRequestException('Only valid images should be uploaded'),
            false,
          );
        }
        return cb(null, true);
      },
    }),
  )
  @Roles({ roles: ['admin', 'consultant'] })
  uploadImages(@UploadedFiles() files, @Body() metadata: CreateMediaDto) {
    const {
      tags: bodyTags,
      attributes: bodyAttributes,
      resourceId,
      resourceType,
    } = metadata;

    /**
     * Sanitize Tags
     */
    const tags = [
      ...new Set(
        Array.from(bodyTags?.split?.(',') ?? []).filter((tag: any) => !!tag),
      ),
    ];

    let attributes = {};
    try {
      attributes = JSON.parse(!!bodyAttributes ? bodyAttributes : '{}');
    } catch (ex) {
      attributes = {};
      throw new BadRequestException(
        'Invalid attributes. attributes should be a valid JSON object',
      );
    }

    return this.mediaService.saveMultipleMedia({
      files,
      attributes,
      tags,
      resourceId: resourceId.trim(),
      resourceType: resourceType.toLowerCase().trim(),
    });
  }
  @Post('videos')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(MediaResourceInterceptor)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        // Allow till 90 MB
        fileSize: 94371840,
      },
      fileFilter(req, file, cb) {
        if (file?.mimetype?.indexOf?.('video') === -1) {
          return cb(
            new BadRequestException('Only valid video should be uploaded'),
            false,
          );
        }
        return cb(null, true);
      },
    }),
  )
  @Roles({ roles: ['admin', 'consultant'] })
  uploadVideos(@UploadedFiles() files, @Body() metadata: CreateMediaDto) {
    const {
      tags: bodyTags,
      attributes: bodyAttributes,
      resourceId,
      resourceType,
    } = metadata;

    /**
     * Sanitize Tags
     */
    const tags = [
      ...new Set(
        Array.from(bodyTags?.split?.(',') ?? []).filter((tag: any) => !!tag),
      ),
    ];

    let attributes = {};
    try {
      attributes = JSON.parse(bodyAttributes);
    } catch (ex) {
      attributes = {};
      throw new BadRequestException(
        'Invalid attributes. attributes should be a valid JSON object',
      );
    }

    return this.mediaService.saveMultipleMedia({
      files,
      attributes,
      tags,
      resourceId: resourceId.trim(),
      resourceType: resourceType.toLowerCase().trim(),
    });
  }
}
