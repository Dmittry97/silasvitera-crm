import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

class OrderItem {
  @Prop({ required: true })
  id!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  price!: number;

  @Prop()
  size?: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop()
  image?: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  customerContact!: string;

  @Prop()
  contactMethod?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  country!: string;

  @Prop()
  pickupPoint?: string;

  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  total!: number;

  @Prop({ default: 'pending' })
  status!: string;

  @Prop()
  trackingCode?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
