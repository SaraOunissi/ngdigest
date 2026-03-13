import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceDocument = HydratedDocument<Resource>;

export type ResourceLanguage = 'fr' | 'en' | 'unknown';

export interface ScoreDetails {
  /** Domain is in the trusted sources whitelist. */
  trustedSource: boolean;
  /** Title or description contains an Angular-related keyword. */
  angularKeyword: boolean;
  /** Published within the last 7 days. */
  isRecent: boolean;
}

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

  /** Pinned resources are never touched by the retention policy. */
  @Prop({ default: false })
  pinned!: boolean;

  /** Set by the retention policy when the article is no longer active. Null means active. */
  @Prop({ default: null, type: Date })
  archivedAt!: Date | null;

  /** Detected language of the article content. */
  @Prop({ default: 'unknown', enum: ['fr', 'en', 'unknown'] })
  language!: ResourceLanguage;

  /** Breakdown of the relevance score criteria. */
  @Prop({
    type: {
      trustedSource: { type: Boolean },
      angularKeyword: { type: Boolean },
      isRecent: { type: Boolean },
    },
    default: null,
  })
  scoreDetails!: ScoreDetails | null;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
