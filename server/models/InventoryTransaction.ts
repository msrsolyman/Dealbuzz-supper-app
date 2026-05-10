import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  warehouseId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  unitCost: number;
  totalCost: number;
  costingMethod: 'FIFO' | 'LIFO' | 'AVERAGE';
  referenceId?: string; // invoice or PO id
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'], required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true },
    costingMethod: { type: String, enum: ['FIFO', 'LIFO', 'AVERAGE'], required: true },
    referenceId: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryTransactionSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ tenantId: 1, warehouseId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ tenantId: 1, type: 1 });

export default mongoose.models.InventoryTransaction || mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
