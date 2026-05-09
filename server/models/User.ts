import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer' | 'dev' | 'product_seller' | 'service_seller' | 'reseller';
  status: 'active' | 'inactive';
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  companyName?: string;
  companyDescription?: string;
  address?: string;
  phone?: string;
  website?: string;
  coverColor?: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email addressing']
    },
    password: { type: String, select: false },
    role: { 
      type: String, 
      enum: ['super_admin', 'admin', 'staff', 'customer', 'dev', 'product_seller', 'service_seller', 'reseller'], 
      required: true 
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    profilePicture: { type: String },
    coverPhoto: { type: String },
    bio: { type: String },
    companyName: { type: String },
    companyDescription: { type: String },
    address: { type: String },
    phone: { type: String },
    website: { type: String },
    coverColor: { type: String, default: '#4f46e5' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// @ts-ignore
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
