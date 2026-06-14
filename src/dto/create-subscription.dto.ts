import { IsEmail, IsIn } from 'class-validator';
import { PLAN_SESSION_CREDITS } from '../plan-quotas';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsIn(Object.keys(PLAN_SESSION_CREDITS))
  plan: string;
}
