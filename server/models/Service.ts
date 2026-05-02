import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isHourly: boolean;
  rate: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: [true, 'Service name is required'] },
    description: { type: String },
    isHourly: { type: Boolean, default: false },
    rate: { type: Number, required: true, min: 0 },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
