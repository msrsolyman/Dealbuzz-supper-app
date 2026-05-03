import mongoose, { Document, Schema } from 'mongoose';

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
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
  dueDate: Date;
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
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    invoiceNumber: { type: String, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'VOID'], default: 'DRAFT' },
    dueDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
