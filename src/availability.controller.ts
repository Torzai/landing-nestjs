import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWeeklySlots() {
    return this.availabilityService.getWeeklySlots();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async replaceWeeklySlots(@Body() dto: UpdateAvailabilityDto) {
    return this.availabilityService.replaceWeeklySlots(dto.slots);
  }

  @Get('slots')
  async getAvailableSlots(@Query('date') date: string, @Query('duration') duration: string) {
    return this.availabilityService.getAvailableSlots(date, Number(duration));
  }
}
