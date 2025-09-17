import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;

  @IsString()
  @IsNotEmpty()
  trustee_id: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  student_info: StudentInfoDto;

  @IsString()
  @IsNotEmpty()
  gateway_name: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  redirect_url?: string;
}

export class WebhookOrderInfoDto {
  @IsString()
  @IsNotEmpty()
  order_id: string; // collect_id/transaction_id

  @IsNumber()
  order_amount: number;

  @IsNumber()
  transaction_amount: number;

  @IsString()
  gateway: string;

  @IsString()
  bank_reference: string;

  @IsString()
  status: string;

  @IsString()
  payment_mode: string;

  @IsString()
  payemnt_details: string;

  @IsString()
  Payment_message: string;

  @IsString()
  payment_time: string;

  @IsString()
  error_message: string;
}

export class WebhookDto {
  @IsNumber()
  status: number;

  @ValidateNested()
  @Type(() => WebhookOrderInfoDto)
  order_info: WebhookOrderInfoDto;
}

