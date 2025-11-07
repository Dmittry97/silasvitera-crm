import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Settings extends Document {
  @Prop({ type: [String], default: [] })
  categories!: string[];

  @Prop({ type: [String], default: [] })
  sizes!: string[];
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
