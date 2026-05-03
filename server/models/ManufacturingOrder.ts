import mongoose, { Schema, Document } from 'mongoose';

export interface IManufacturingMaterial {
  rawMaterialId: mongoose.Types.ObjectId;
  quantityPerUnit: number;
}

export interface IManufacturingOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  finalProductId: mongoose.Types.ObjectId;
  quantityToProduce: number;
  materials: IManufacturingMaterial[];
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema({
  rawMaterialId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityPerUnit: { type: Number, required: true }
});

const ManufacturingOrderSchema = new Schema<IManufacturingOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    finalProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantityToProduce: { type: Number, required: true },
    materials: [MaterialSchema],
    status: { type: String, enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED'], default: 'DRAFT' }
  },
  { timestamps: true }
);

export default mongoose.models.ManufacturingOrder || mongoose.model<IManufacturingOrder>('ManufacturingOrder', ManufacturingOrderSchema);
