import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String },
    address: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
