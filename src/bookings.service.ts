import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './booking.schema';
import { EmailService } from './email.service';
import { AvailabilityService } from './availability.service';
import { SubscriptionsService } from './subscriptions.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private emailService: EmailService,
    private availabilityService: AvailabilityService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(data: CreateBookingDto) {
    console.log('📝 Recibiendo booking:', data);
    const available = await this.availabilityService.isSlotAvailable(data.date, data.duration);
    if (!available) {
      throw new BadRequestException('El horario seleccionado no está disponible.');
    }

    try {
      // Si el email tiene una suscripción con saldo, la reserva se cuenta contra ese plan
      const activePlan = await this.subscriptionsService.getActivePlan(data.email);
      const plan = activePlan ?? data.plan;

      const booking = new this.bookingModel({ ...data, plan, creditConsumed: !!activePlan });
      const saved = await booking.save();
      console.log('✅ Booking guardado:', saved._id);

      if (activePlan) {
        this.subscriptionsService.consumeCredit(data.email).catch(err => {
          console.error('⚠️ Error actualizando saldo de sesiones (no bloqueante):', err.message);
        });
      }

      // Enviar emails sin bloquear //7HYD6R3D3L1C5JG5PHYSFMYZ
      this.emailService.sendConfirmation(data.email, data.name, new Date(data.date), plan).catch(err => {
        console.error('⚠️ Error enviando email (no bloqueante):', err.message);
      });
      this.emailService.sendBookingNotification(data.name, data.email, new Date(data.date), data.duration, plan).catch(err => {
        console.error('⚠️ Error enviando notificación (no bloqueante):', err.message);
      });

      return saved;
    } catch (error) {
      console.error('❌ Error guardando booking:', error);
      throw error;
    }
  }

  async findAll() {
    return this.bookingModel.find().exec();
  }

  async getLastBookingName(email: string): Promise<{ name: string } | null> {
    if (!email) {
      return null;
    }

    const normalized = email.toLowerCase().trim();
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = { $regex: new RegExp(`^${escaped}$`, 'i') };
    const lastBooking = await this.bookingModel
      .findOne({ email: emailRegex })
      .sort({ createdAt: -1 })
      .lean();

    return lastBooking ? { name: lastBooking.name } : null;
  }

  async findOne(id: string) {
    return this.bookingModel.findById(id).exec();
  }

  async delete(id: string) {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }
}
