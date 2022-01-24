import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { mediaShortId } from '@utils/string';
import { Document } from 'mongoose';

@Schema({
  strict: true,
  timestamps: true,
})
export class Media extends Document {
  @Prop({
    default: [],
    type: [String],
  })
  tags: string[];

  @Prop({
    default: {},
    type: Object,
  })
  attributes: any;

  @Prop({
    default: '',
    type: String,
  })
  key: string;

  @Prop({
    default: '',
    type: String,
  })
  resourceType: string;

  @Prop({
    default: '',
    type: String,
  })
  resourceId: string;

  @Prop()
  originalname: string;

  @Prop()
  encoding: string;

  @Prop()
  mimetype: string;

  @Prop()
  contentType: string;

  @Prop()
  size: number;

  @Prop()
  location: string;

  @Prop({
    default: () => mediaShortId(),
  })
  uniqueId?: string;

  @Prop({
    default: null,
  })
  deletedAt?: number | null;

  @Prop({
    default: new Date().getTime(),
  })
  createdAt?: number;

  @Prop({
    default: new Date().getTime(),
  })
  updatedAt?: number;
}

const MediaSchema = SchemaFactory.createForClass(Media);

export { MediaSchema };
