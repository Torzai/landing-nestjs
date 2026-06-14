import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  async create(@Body() body: CreateBookingDto) {
    return this.bookingsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('last-name')
  async getLastName(@Query('email') email: string) {
    return this.bookingsService.getLastBookingName(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }
}
