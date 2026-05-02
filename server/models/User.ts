import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer' | 'dev';
  status: 'active' | 'inactive';
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
      enum: ['super_admin', 'admin', 'staff', 'customer', 'dev'], 
      required: true 
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

// @ts-ignore
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
