import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesTarget extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  targetAmount: number;
  achievedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SalesTargetSchema = new Schema<ISalesTarget>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    targetAmount: { type: Number, required: true },
    achievedAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.SalesTarget || mongoose.model<ISalesTarget>('SalesTarget', SalesTargetSchema);
