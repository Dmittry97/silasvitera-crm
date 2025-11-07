import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title!: string;

  @Prop({ unique: true, sparse: true })
  article?: string;

  @Prop({ required: true })
  price!: number;

  @Prop()
  mainImage?: string;

  @Prop()
  backImage?: string;

  @Prop({ type: [String], default: [] })
  otherImages?: string[];

  @Prop({ type: [String], default: [] })
  sizes?: string[];

  @Prop({ type: [String], default: [] })
  colors!: string[];

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ default: 0 })
  stock!: number;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ default: false })
  isReserved!: boolean;

  @Prop()
  reservedUntil?: Date;

  @Prop()
  reservedBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
