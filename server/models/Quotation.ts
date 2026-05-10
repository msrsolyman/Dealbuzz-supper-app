import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  productId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IQuotation extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  quotationNumber: string;
  items: IQuotationItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'INVOICED';
  validUntil?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const QuotationSchema = new Schema<IQuotation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    quotationNumber: { type: String, required: true, index: true },
    items: [QuotationItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'INVOICED'], default: 'DRAFT' },
    validUntil: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
