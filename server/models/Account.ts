import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: [true, 'Account name is required'] },
    description: { type: String },
    type: { type: String, enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], required: true },
    balance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
