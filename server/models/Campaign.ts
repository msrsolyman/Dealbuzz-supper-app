import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  type: 'EMAIL' | 'SMS';
  targetAudience: 'ALL' | 'CUSTOMERS' | 'LEADS';
  message: string;
  status: 'DRAFT' | 'SENT' | 'SCHEDULED';
  scheduledDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['EMAIL', 'SMS'], required: true },
    targetAudience: { type: String, enum: ['ALL', 'CUSTOMERS', 'LEADS'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'SCHEDULED'], default: 'DRAFT' },
    scheduledDate: { type: Date },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
