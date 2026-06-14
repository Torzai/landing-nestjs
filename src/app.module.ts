import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { EmailService } from './email.service';
import { Booking, BookingSchema } from './booking.schema';
import { AvailabilitySlot, AvailabilitySlotSchema } from './availability.schema';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Subscription, SubscriptionSchema } from './subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentoria'),
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: AvailabilitySlot.name, schema: AvailabilitySlotSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    AuthModule,
  ],
  controllers: [AppController, BookingsController, AvailabilityController, SubscriptionsController],
  providers: [
    AppService,
    BookingsService,
    EmailService,
    AvailabilityService,
    SubscriptionsService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
