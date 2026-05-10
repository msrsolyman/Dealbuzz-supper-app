import mongoose, { Schema, Document } from 'mongoose';

export interface IReturnItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  condition: 'GOOD' | 'DAMAGED';
}

export interface IReturn extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  reason: string;
  items: IReturnItem[];
  refundAmount: number;
  status: 'PENDING' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  condition: { type: String, enum: ['GOOD', 'DAMAGED'], default: 'GOOD' }
});

const ReturnSchema = new Schema<IReturn>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    reason: { type: String, required: true },
    items: [ReturnItemSchema],
    refundAmount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }
  },
  { timestamps: true }
);

export default mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);
