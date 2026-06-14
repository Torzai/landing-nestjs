import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { AvailabilitySlotDto } from './availability-slot.dto';

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}
