import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from './subscription.schema';
import { Booking } from './booking.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PLAN_SESSION_CREDITS } from './plan-quotas';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async upsert(data: CreateSubscriptionDto) {
    const email = data.email.toLowerCase().trim();
    const planCredits = PLAN_SESSION_CREDITS[data.plan];

    // Reservas ya hechas con este plan antes de tener saldo (o entre el agotamiento y la
    // renovación) que aún no descontaron sesión: se liquidan contra el nuevo saldo.
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = { $regex: new RegExp(`^${escaped}$`, 'i') };
    const pending = await this.bookingModel.countDocuments({
      email: emailRegex,
      plan: data.plan,
      creditConsumed: { $ne: true },
    });
    if (pending > 0) {
      await this.bookingModel.updateMany(
        { email: emailRegex, plan: data.plan, creditConsumed: { $ne: true } },
        { creditConsumed: true },
      );
    }

    const existing = await this.subscriptionModel.findOne({ email });
    if (existing) {
      existing.plan = data.plan;
      existing.credits = Math.max(0, (existing.credits ?? 0) + planCredits - pending);
      return existing.save();
    }

    return this.subscriptionModel.create({ email, plan: data.plan, credits: Math.max(0, planCredits - pending) });
  }

  async findAll() {
    return this.subscriptionModel.find().sort({ email: 1 }).exec();
  }

  async getRemaining(email: string) {
    if (!email) {
      return null;
    }

    const normalized = email.toLowerCase().trim();
    const subscription = await this.subscriptionModel.findOne({ email: normalized }).lean();
    if (!subscription || !PLAN_SESSION_CREDITS[subscription.plan]) {
      return null;
    }

    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = { $regex: new RegExp(`^${escaped}$`, 'i') };
    const lastBooking = await this.bookingModel
      .findOne({ email: emailRegex })
      .sort({ createdAt: -1 })
      .lean();

    return {
      plan: subscription.plan,
      remaining: subscription.credits ?? 0,
      name: lastBooking?.name,
    };
  }

  /** Devuelve el plan de la suscripción activa (con saldo) de este email, o null si no tiene. */
  async getActivePlan(email: string): Promise<string | null> {
    const normalized = email.toLowerCase().trim();
    const subscription = await this.subscriptionModel
      .findOne({ email: normalized, credits: { $gt: 0 } })
      .lean();
    return subscription?.plan ?? null;
  }

  async consumeCredit(email: string) {
    const normalized = email.toLowerCase().trim();
    await this.subscriptionModel.updateOne(
      { email: normalized, credits: { $gt: 0 } },
      { $inc: { credits: -1 } },
    );
  }

  async delete(id: string) {
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }
}
