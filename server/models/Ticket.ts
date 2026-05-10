import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  tenantId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: mongoose.Types.ObjectId;
  messages: Array<{
    senderType: 'customer' | 'staff';
    senderId: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    senderType: { type: String, enum: ['customer', 'staff'] },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
