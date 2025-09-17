import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../schemas/order-status.schema';
import { User, UserSchema } from '../schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
class SeedModule {}

async function seedData() {
  console.log('Starting data seeding...');

  const app = await NestFactory.createApplicationContext(SeedModule);
  const orderModel = app.get<Model<Order>>(getModelToken(Order.name));
  const orderStatusModel = app.get<Model<OrderStatus>>(getModelToken(OrderStatus.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  try {
    await orderModel.deleteMany({});
    await orderStatusModel.deleteMany({});
    await userModel.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 12);
    await userModel.create({
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin',
    });

    const schoolIds = [
      '65b0e6293e9f76a9694d84b4',
      '65b0e6293e9f76a9694d84b5',
      '65b0e6293e9f76a9694d84b6',
    ];

    const statuses = ['success', 'pending', 'failed'];
    const gateways = ['PhonePe', 'Paytm', 'Razorpay', 'GooglePay'];
    const paymentModes = ['upi', 'card', 'netbanking', 'wallet'];

    for (let i = 1; i <= 50; i++) {
      const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
      const gateway = gateways[Math.floor(Math.random() * gateways.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const amount = Math.floor(Math.random() * 5000) + 1000;

      const order = await orderModel.create({
        school_id: schoolId,
        trustee_id: '65b0e552dd31950a9b41c5ba',
        student_info: {
          name: `Student ${i}`,
          id: `STD${String(i).padStart(3, '0')}`,
          email: `student${i}@example.com`,
        },
        gateway_name: gateway,
        custom_order_id: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      await orderStatusModel.create({
        collect_id: order._id,
        order_amount: amount,
        transaction_amount: status === 'success' ? amount : status === 'failed' ? 0 : amount,
        payment_mode: paymentMode,
        payment_details: status === 'success' ? `${paymentMode}@okbank` : '',
        bank_reference: status === 'success' ? `${gateway.toUpperCase()}${Math.random().toString().substr(2, 8)}` : '',
        payment_message: status === 'success' ? 'Payment successful' : status === 'failed' ? 'Payment failed' : 'Payment pending',
        status: status,
        error_message: status === 'failed' ? 'Insufficient funds' : '',
        payment_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    console.log('✅ Sample data inserted successfully');
    console.log('Created:');
    console.log('- 1 admin user (admin@school.com / admin123)');
    console.log('- 50 sample orders with corresponding statuses');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  seedData();
}

export default seedData;


