import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  collectionName: string;
  documentId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    userId: { type: Schema.Types.Mixed }, // Mixed because it could be string (like "system" for anon logins)
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'], required: true },
    collectionName: { type: String, required: true },
    documentId: { type: String },
    oldData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1 });
AuditLogSchema.index({ collectionName: 1, documentId: 1 });

// @ts-ignore
export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
