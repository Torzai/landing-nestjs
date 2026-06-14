import { IsInt, Matches, Max, Min } from 'class-validator';

export class AvailabilitySlotDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Matches(/^([01]\d|2[0-3]):(00|30)$/, {
    message: 'startTime debe tener el formato HH:mm en bloques de 30 minutos',
  })
  startTime: string;
}
