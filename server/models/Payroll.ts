import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  baseSalary: number;
  commission: number;
  deductions: number;
  netSalary: number;
  status: 'PENDING' | 'PAID';
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
    paymentDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
