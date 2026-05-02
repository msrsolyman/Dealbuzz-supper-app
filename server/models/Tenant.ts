import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: [true, 'Tenant name is required'], trim: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

// @ts-ignore
export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
