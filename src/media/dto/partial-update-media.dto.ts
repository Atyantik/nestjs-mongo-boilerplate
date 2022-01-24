import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PartialUpdateMediaDto {
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
}
