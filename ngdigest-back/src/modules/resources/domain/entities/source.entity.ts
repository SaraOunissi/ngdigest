import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SourceDocument = HydratedDocument<Source>;

export enum SourceType {
  API = 'API',
  RSS = 'RSS',
}

@Schema({ timestamps: true })
export class Source {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: SourceType })
  type!: SourceType;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  language!: string;

  @Prop({ default: true })
  active!: boolean;
}

export const SourceSchema = SchemaFactory.createForClass(Source);
