import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  brand?: string;
  shortDescription?: string;
  
  price: number; // selling price
  regularPrice?: number;
  discount?: number;
  stockCount: number;
  damagedStock?: number;
  lowStockThreshold: number;
  warehouseStock?: { warehouseId: mongoose.Types.ObjectId; stockCount: number }[];
  sku: string;
  barcode?: string;

  mainImage?: string;
  galleryImages?: string[];
  videoUrl?: string;

  description?: string; // Product Details
  features?: string[];
  benefits?: string[];
  usageInstructions?: string;

  variations?: { size?: string, color?: string, weightOrCapacity?: string }[];

  deliveryCharge?: number;
  deliveryTime?: string;
  locationAvailability?: string;

  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  searchKeywords?: string[];

  warrantyInfo?: string;
  returnPolicy?: string;
  supplierInfo?: string;

  approvalStatus: 'pending' | 'approved' | 'rejected';

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: [true, 'Product name is required'] },
    category: { type: String, required: true },
    brand: { type: String },
    shortDescription: { type: String },
    
    price: { type: Number, required: true, min: 0 },
    regularPrice: { type: Number, min: 0 },
    discount: { type: Number, min: 0, max: 100 },
    stockCount: { type: Number, default: 0 },
    damagedStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    warehouseStock: [{
      warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
      stockCount: { type: Number, default: 0 }
    }],
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, index: true },

    mainImage: { type: String },
    galleryImages: [{ type: String }],
    videoUrl: { type: String },

    description: { type: String },
    features: [{ type: String }],
    benefits: [{ type: String }],
    usageInstructions: { type: String },

    variations: [{
      size: { type: String },
      color: { type: String },
      weightOrCapacity: { type: String }
    }],

    deliveryCharge: { type: Number, min: 0 },
    deliveryTime: { type: String },
    locationAvailability: { type: String },

    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    searchKeywords: [{ type: String }],

    warrantyInfo: { type: String },
    returnPolicy: { type: String },
    supplierInfo: { type: String },

    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
