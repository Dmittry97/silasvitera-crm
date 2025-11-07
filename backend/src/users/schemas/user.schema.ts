import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

class Address {
  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  pickupPoint?: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  telegram?: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user' })
  role!: string;

  @Prop()
  phone?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ type: [Address], default: [] })
  addresses!: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
