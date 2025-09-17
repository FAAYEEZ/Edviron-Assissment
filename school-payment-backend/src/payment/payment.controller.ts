// src/payment/payment.controller.ts
import { 
    Controller, 
    Post, 
    Get, 
    Body, 
    Param, 
    Query, 
    UseGuards 
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { PaymentService } from './payment.service';
  import { CreatePaymentDto, WebhookDto } from '../dto/payment.dto';
  
  @Controller()
  export class PaymentController {
    constructor(private paymentService: PaymentService) {}
  
    @Post('create-payment')
    @UseGuards(JwtAuthGuard)
    async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
      return this.paymentService.createPayment(createPaymentDto);
    }
  
    @Post('webhook')
    async handleWebhook(@Body() webhookDto: WebhookDto) {
      return this.paymentService.handleWebhook(webhookDto);
    }
  
    @Get('transactions')
    @UseGuards(JwtAuthGuard)
    async getAllTransactions(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('sort') sort = 'createdAt',
      @Query('order') order = 'desc'
    ) {
      return this.paymentService.getAllTransactions(+page, +limit, sort, order);
    }
  
    @Get('transactions/school/:schoolId')
    @UseGuards(JwtAuthGuard)
    async getTransactionsBySchool(
      @Param('schoolId') schoolId: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10
    ) {
      return this.paymentService.getTransactionsBySchool(schoolId, +page, +limit);
    }
  
    @Get('transaction-status/:customOrderId')
    @UseGuards(JwtAuthGuard)
    async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
      return this.paymentService.getTransactionStatus(customOrderId);
    }
  }