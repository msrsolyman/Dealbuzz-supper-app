import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  poNumber: string;
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  amountPaid: number;
  warehouseId?: mongoose.Types.ObjectId;
  orderDate: Date;
  expectedDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  total: { type: Number, required: true }
});

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    poNumber: { type: String, required: true, index: true },
    items: [PurchaseOrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'], default: 'DRAFT' },
    paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID'], default: 'UNPAID' },
    amountPaid: { type: Number, default: 0 },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    orderDate: { type: Date, default: Date.now },
    expectedDate: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
