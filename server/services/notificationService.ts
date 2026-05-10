import Notification from '../models/Notification.ts';
import { getIO, getUserSocketId } from './socketService.ts';
import nodemailer from 'nodemailer'; // For email
import User from '../models/User.ts';

interface SendNotificationOptions {
  tenantId: string;
  userId?: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category?: 'ORDER' | 'STOCK' | 'PAYMENT' | 'SYSTEM' | 'GENERAL';
  actionLink?: string;
  channels?: ('IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PUSH')[];
}

export const sendNotification = async (options: SendNotificationOptions) => {
  const { tenantId, userId, title, message, type = 'INFO', category = 'GENERAL', actionLink, channels = ['IN_APP'] } = options;

  let dbNotification: any = null;

  if (channels.includes('IN_APP')) {
    // Save to DB
    dbNotification = new Notification({
      tenantId,
      userId,
      title,
      message,
      type,
      category,
      actionLink
    });
    await dbNotification.save();

    // Send via socket.io
    try {
      const io = getIO();
      if (userId) {
        const socketId = getUserSocketId(userId);
        if (socketId) {
          io.to(socketId).emit('notification', dbNotification);
        }
      } else {
        // Send to everyone in the tenant room
        io.to(`tenant_${tenantId}`).emit('notification', dbNotification);
      }
    } catch (error) {
      console.error('Socket error during notification emit:', error);
    }
  }

  // Handle other channels (Email, WhatsApp, Push)
  if (channels.includes('EMAIL') && userId) {
    try {
      const user = await User.findById(userId).lean();
      if (user && user.email) {
        // Pseudo logic for sending email
        console.log(`[EMAIL] Sending to ${user.email}: ${title} - ${message}`);
        // Create a real transporter when needed
        // let transporter = nodemailer.createTransport({ ... });
        // await transporter.sendMail({ from: 'no-reply@dealbuzz.com', to: user.email, subject: title, text: message });
      }
    } catch (e) {
      console.error("Email sending failed", e);
    }
  }

  if (channels.includes('WHATSAPP') && userId) {
    try {
      const user = await User.findById(userId).lean();
      if (user && (user as any).phone) {
        // Third part WhatsApp API (Twilio / MessageBird)
        console.log(`[WHATSAPP] Sending to ${(user as any).phone}: ${title} - ${message}`);
      }
    } catch (e) {
      console.error("WhatsApp sending failed", e);
    }
  }

  if (channels.includes('PUSH') && userId) {
    // Implement FCM or Web Push logic
    console.log(`[PUSH] Sending PN to User ${userId}: ${title}`);
  }

  return dbNotification;
};

// Helper for Order Alerts
export const sendOrderAlert = async (tenantId: string, orderId: string, amount: number, userId?: string) => {
  return sendNotification({
    tenantId,
    userId,
    title: 'New Order Received',
    message: `A new order has been received for $${amount}.`,
    type: 'SUCCESS',
    category: 'ORDER',
    actionLink: `/invoices/${orderId}`,
    channels: ['IN_APP', 'EMAIL'] // E.g., send an email as well
  });
};

// Helper for Low Stock Alerts
export const sendStockAlert = async (tenantId: string, productName: string, stock: number) => {
  return sendNotification({
    tenantId,
    title: 'Low Stock Alert',
    message: `Product "${productName}" is running low on stock (${stock} left).`,
    type: 'WARNING',
    category: 'STOCK',
    actionLink: `/inventory/products`,
    channels: ['IN_APP', 'EMAIL']
  });
};

// Helper for Payment Alerts
export const sendPaymentAlert = async (tenantId: string, customerName: string, amount: number) => {
  return sendNotification({
    tenantId,
    title: 'Payment Received',
    message: `Received payment of $${amount} from ${customerName}.`,
    type: 'SUCCESS',
    category: 'PAYMENT',
    actionLink: `/accounts`,
    channels: ['IN_APP']
  });
};
