import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Subscription extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  plan: string;

  @Prop({ default: Date.now })
  startDate: Date;

  @Prop({ required: true, default: 0 })
  credits: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
