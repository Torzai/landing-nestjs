import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  duration: number;

  @Prop()
  plan?: string;

  @Prop({ default: false })
  creditConsumed: boolean;

  @Prop({ default: 'confirmed' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
