import mongoose, { Document, Schema } from 'mongoose';

export interface IAccountingTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  referenceId?: string; // invoice number, etc.
  createdAt: Date;
  updatedAt: Date;
}

const AccountingTransactionSchema = new Schema<IAccountingTransaction>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true },
    referenceId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.AccountingTransaction || mongoose.model<IAccountingTransaction>('AccountingTransaction', AccountingTransactionSchema);
