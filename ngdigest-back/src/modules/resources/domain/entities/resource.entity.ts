import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true })
  url!: string;

  @Prop({ required: true })
  source!: string;

  @Prop({ required: true })
  publishedAt!: Date;

  @Prop({ default: 0 })
  score!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ default: false })
  isFavorite!: boolean;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
