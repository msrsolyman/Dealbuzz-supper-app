import mongoose, { Document, Schema } from 'mongoose';
import { multiTenantPlugin } from '../utils/mongoosePlugins.ts';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // If null, it could be a tenant-wide notification
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'ORDER' | 'STOCK' | 'PAYMENT' | 'SYSTEM' | 'GENERAL';
  isRead: boolean;
  actionLink?: string; // e.g. /invoices/123
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
    category: { type: String, enum: ['ORDER', 'STOCK', 'PAYMENT', 'SYSTEM', 'GENERAL'], default: 'GENERAL' },
    isRead: { type: Boolean, default: false },
    actionLink: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
NotificationSchema.index({ tenantId: 1, isRead: 1 });

NotificationSchema.plugin(multiTenantPlugin);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
