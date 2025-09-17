
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WebhookLogs extends Document {
  @Prop({ required: true })
  event_type: string;

  @Prop({ type: Object })
  payload: any;

  @Prop({ required: true })
  status: number;

  @Prop()
  error_message: string;

  @Prop({ type: Date, default: Date.now })
  received_at: Date;
}

export const WebhookLogsSchema = SchemaFactory.createForClass(WebhookLogs);