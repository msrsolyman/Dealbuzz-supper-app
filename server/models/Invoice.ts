import mongoose, { Document, Schema } from 'mongoose';
import { multiTenantPlugin } from '../utils/mongoosePlugins.ts';

export interface IInvoiceItem {
  itemType: 'Product' | 'Service';
  itemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface IInvoice extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
  dueDate: Date;
  
  // New features
  deliveryStatus?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  trackingLink?: string;
  paymentMethod?: string; // Stripe, bKash, SSLCommerz, Cash, etc.
  isRecurring?: boolean;
  recurringInterval?: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  itemType: { type: String, enum: ['Product', 'Service'], required: true },
  itemId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User' },
    invoiceNumber: { type: String, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'VOID'], default: 'DRAFT' },
    dueDate: { type: Date, required: true },
    
    deliveryStatus: { type: String, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'], default: 'PENDING' },
    trackingLink: { type: String },
    paymentMethod: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: String, enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] },
    
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, customerId: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, deliveryStatus: 1 });

InvoiceSchema.plugin(multiTenantPlugin);

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
