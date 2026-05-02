import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  sku: string;
  price: number;
  stockCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: [true, 'Product name is required'] },
    description: { type: String },
    category: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stockCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
