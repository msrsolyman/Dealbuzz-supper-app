import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    location: { type: String },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
