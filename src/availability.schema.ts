import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AvailabilitySlot extends Document {
  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0 = domingo ... 6 = sábado (Date.getUTCDay)

  @Prop({ required: true })
  startTime: string; // "HH:mm", alineado a bloques de 30 minutos
}

export const AvailabilitySlotSchema = SchemaFactory.createForClass(AvailabilitySlot);
AvailabilitySlotSchema.index({ dayOfWeek: 1, startTime: 1 }, { unique: true });
