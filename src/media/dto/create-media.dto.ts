import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    description: `Add custom tags to the media like, Menu, PDF, Logo, ProfileImage, etc.
      Please note, the tags should be comma seperated`,
    type: [String],
  })
  @IsOptional()
  @IsString()
  tags: string;

  @ApiProperty({
    description: 'Add custom attributes to the media as a valid JSON.',
    type: Object,
    default: {},
  })
  @IsString()
  @IsOptional()
  attributes?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
    description: 'Upload multiple media files as multipart/form-data',
  })
  files?: any;

  @ApiProperty({
    description: 'Resource/Model ID',
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description:
      'Resource/Model type, it is an enum and supports Hotel, Restaurant, Spa, User',
  })
  @IsString()
  resourceType: string;
}
