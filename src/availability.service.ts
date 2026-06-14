import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvailabilitySlot } from './availability.schema';
import { Booking } from './booking.schema';
import { AvailabilitySlotDto } from './dto/availability-slot.dto';

const SLOT_MINUTES = 30;

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(AvailabilitySlot.name) private availabilityModel: Model<AvailabilitySlot>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async getWeeklySlots() {
    return this.availabilityModel.find().sort({ dayOfWeek: 1, startTime: 1 }).exec();
  }

  async replaceWeeklySlots(slots: AvailabilitySlotDto[]) {
    await this.availabilityModel.deleteMany({});
    if (slots.length) {
      await this.availabilityModel.insertMany(slots);
    }
    return this.getWeeklySlots();
  }

  async getAvailableSlots(date: string, duration: number): Promise<string[]> {
    const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();

    const daySlots = await this.availabilityModel.find({ dayOfWeek }).lean();
    const availableMinutes = new Set(daySlots.map((slot) => this.timeToMinutes(slot.startTime)));

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    const bookings = await this.bookingModel
      .find({ date: { $gte: dayStart, $lte: dayEnd } })
      .lean();

    const bookedRanges = bookings.map((booking) => {
      const bookingDate = new Date(booking.date);
      const start = bookingDate.getUTCHours() * 60 + bookingDate.getUTCMinutes();
      return { start, end: start + booking.duration * 60 };
    });

    const durationMinutes = duration * 60;
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    const result: string[] = [];
    for (const start of availableMinutes) {
      if (isToday && start <= nowMinutes) continue;

      const end = start + durationMinutes;
      let covered = true;
      for (let t = start; t < end; t += SLOT_MINUTES) {
        if (!availableMinutes.has(t)) {
          covered = false;
          break;
        }
      }
      if (!covered) continue;

      const overlaps = bookedRanges.some((range) => start < range.end && end > range.start);
      if (overlaps) continue;

      result.push(this.minutesToTime(start));
    }

    return result.sort();
  }

  async isSlotAvailable(dateISO: string, duration: number): Promise<boolean> {
    const requested = new Date(dateISO);
    const date = dateISO.split('T')[0];
    const time = this.minutesToTime(requested.getUTCHours() * 60 + requested.getUTCMinutes());
    const slots = await this.getAvailableSlots(date, duration);
    return slots.includes(time);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }
}
