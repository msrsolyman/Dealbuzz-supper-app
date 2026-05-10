import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { multiTenantPlugin } from '../utils/mongoosePlugins.ts';

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer' | 'dev' | 'product_seller' | 'service_seller' | 'reseller';
  status: 'active' | 'inactive' | 'locked';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  allowedFeatures?: string[];
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

  // Security
  refreshTokens?: string[];
  loginAttempts?: number;
  lockUntil?: Date;
  lastLogin?: Date;
  lastActiveAt?: Date;
  
  // 2FA
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
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
    status: { type: String, enum: ['active', 'inactive', 'locked'], default: 'active' },
    approvalStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: function(this: any) {
        if (['product_seller', 'service_seller', 'reseller'].includes(this.role)) {
          return 'pending';
        }
        return 'approved';
      }
    },
    allowedFeatures: [{ type: String }],
    profilePicture: { type: String },
    coverPhoto: { type: String },
    bio: { type: String },
    companyName: { type: String },
    companyDescription: { type: String },
    address: { type: String },
    phone: { type: String },
    website: { type: String },
    coverColor: { type: String, default: '#4f46e5' },
    isDeleted: { type: Boolean, default: false },

    // Security
    refreshTokens: [{ type: String }],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    lastActiveAt: { type: Date },

    twoFactorSecret: { type: String, select: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// User compound indexes
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, email: 1 }); // Email is already unique, but helps multi-tenant query speed

UserSchema.plugin(multiTenantPlugin);

// @ts-ignore
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
