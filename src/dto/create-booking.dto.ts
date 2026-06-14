import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Max(8)
  duration: number;

  @IsOptional()
  @IsString()
  plan?: string;
}
