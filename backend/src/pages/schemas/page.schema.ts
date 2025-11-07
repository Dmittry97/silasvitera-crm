import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
