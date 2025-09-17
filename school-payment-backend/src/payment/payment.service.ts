
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { Order } from '../schemas/order.schema';
import { OrderStatus } from '../schemas/order-status.schema';
import { WebhookLogs } from '../schemas/webhook-logs.schema';
import { CreatePaymentDto, WebhookDto } from '../dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatus>,
    @InjectModel(WebhookLogs.name) private webhookLogsModel: Model<WebhookLogs>,
    private configService: ConfigService,
  ) {}

  async createPayment(paymentData: CreatePaymentDto) {
    try {
      // Create order in database
      const customOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const order = new this.orderModel({
        ...paymentData,
        custom_order_id: customOrderId,
      });
      
      const savedOrder = await order.save();

      // Edviron collect request integration
      const baseUrl = this.configService.get<string>('EDVIRON_BASE_URL') || 'https://dev-vanilla.edviron.com';
      const apiKey = this.configService.get<string>('EDVIRON_API_KEY');
      const pgSecret = this.configService.get<string>('EDVIRON_PG_SECRET');
      if (!apiKey || !pgSecret) {
        throw new BadRequestException('Payment gateway credentials not configured');
      }

      const callbackUrl = paymentData.redirect_url || this.configService.get<string>('PUBLIC_APP_URL') || 'http://localhost:3001/payment-success';

      // sign: JWT with { school_id, amount, callback_url }
      const signPayload = {
        school_id: paymentData.school_id,
        amount: String(paymentData.amount),
        callback_url: callbackUrl,
      } as const;
      const sign = jwt.sign(signPayload, pgSecret, { algorithm: 'HS256' });

      const response = await axios.post(
        `${baseUrl}/erp/create-collect-request`,
        {
          school_id: paymentData.school_id,
          amount: String(paymentData.amount),
          callback_url: callbackUrl,
          sign,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Create initial order status
      const orderStatus = new this.orderStatusModel({
        collect_id: savedOrder._id,
        order_amount: paymentData.amount,
        transaction_amount: paymentData.amount,
        payment_mode: 'pending',
        status: 'initiated',
        payment_time: new Date(),
      });

      await orderStatus.save();

      return {
        order_id: savedOrder._id,
        custom_order_id: customOrderId,
        payment_url: response.data.Collect_request_url || response.data.collect_request_url || response.data.payment_url,
        status: 'initiated',
      };

    } catch (error) {
      throw new BadRequestException(`Payment creation failed: ${error.message}`);
    }
  }

  async handleWebhook(webhookData: WebhookDto) {
    try {
      // Log webhook
      const log = new this.webhookLogsModel({
        event_type: 'payment_webhook',
        payload: webhookData,
        status: webhookData.status,
        received_at: new Date(),
      });
      await log.save();

      // Find and update order status
      const orderStatus = await this.orderStatusModel.findOneAndUpdate(
        { collect_id: new Types.ObjectId(webhookData.order_info.order_id) },
        {
          order_amount: webhookData.order_info.order_amount,
          transaction_amount: webhookData.order_info.transaction_amount,
          payment_mode: webhookData.order_info.payment_mode,
          payment_details: webhookData.order_info.payemnt_details,
          bank_reference: webhookData.order_info.bank_reference,
          payment_message: webhookData.order_info.Payment_message,
          status: webhookData.order_info.status,
          error_message: webhookData.order_info.error_message,
          payment_time: new Date(webhookData.order_info.payment_time),
        },
        { new: true }
      );

      if (!orderStatus) {
        throw new BadRequestException('Order not found');
      }

      return { message: 'Webhook processed successfully' };

    } catch (error) {
      // Log error
      const errorLog = new this.webhookLogsModel({
        event_type: 'payment_webhook_error',
        payload: webhookData,
        status: 500,
        error_message: error.message,
        received_at: new Date(),
      });
      await errorLog.save();

      throw error;
    }
  }

  async getAllTransactions(page = 1, limit = 10, sort = 'createdAt', order = 'desc') {
    const skip = (page - 1) * limit;
    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          student_info: 1,
          payment_time: '$status_info.payment_time',
          createdAt: 1
        }
      },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: limit }
    ];

    const transactions = await this.orderModel.aggregate(pipeline);
    const total = await this.orderModel.countDocuments();

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTransactionsBySchool(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { school_id: schoolId } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          student_info: 1,
          payment_time: '$status_info.payment_time'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const transactions = await this.orderModel.aggregate(pipeline);
    const total = await this.orderModel.countDocuments({ school_id: schoolId });

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTransactionStatus(customOrderId: string) {
    const pipeline: any[] = [
      { $match: { custom_order_id: customOrderId } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          custom_order_id: 1,
          school_id: 1,
          student_info: 1,
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          payment_mode: '$status_info.payment_mode',
          payment_message: '$status_info.payment_message',
          payment_time: '$status_info.payment_time',
          error_message: '$status_info.error_message'
        }
      }
    ];

    const result = await this.orderModel.aggregate(pipeline);
    const order = result[0];

    // If we have a mapping to external collect_request_id, we could also poll status here.
    // Edviron status API requires: collect_request_id, school_id, sign (JWT with school_id + collect_request_id)
    // Optional enhancement: store collect_request_id on Order and query here.

    return order || null;
  }
}