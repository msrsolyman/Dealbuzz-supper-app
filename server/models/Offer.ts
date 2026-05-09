import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'Product' | 'Service';
  items: mongoose.Types.ObjectId[];
  discountPercentage?: number;
  discountAmount?: number;
  bannerImage?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'EXPIRED';
  priority: number; // For super admin to order them (lower number means higher priority, 0 means not prioritized)
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Product', 'Service'], required: true },
    items: [{ type: Schema.Types.ObjectId, refPath: 'type' }], // Refers to Product or Service
    discountPercentage: { type: Number, min: 0, max: 100 },
    discountAmount: { type: Number, min: 0 },
    bannerImage: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED'], default: 'PENDING' },
    priority: { type: Number, default: 999 }, // 999 means regular priority. Super admin sets 1, 2, 3 etc.
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
