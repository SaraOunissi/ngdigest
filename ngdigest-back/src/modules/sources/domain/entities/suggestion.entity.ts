import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SuggestionDocument = HydratedDocument<Suggestion>;

@Schema({ timestamps: true })
export class Suggestion {
  @Prop({ required: true, trim: true, maxlength: 500 })
  url!: string;

  @Prop({ trim: true, maxlength: 1000, default: '' })
  reason?: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status!: 'pending' | 'approved' | 'rejected';
}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);
