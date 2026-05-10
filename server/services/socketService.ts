import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.ts';

let io: SocketIOServer;

const connectedUsers = new Map<string, string>(); // userId -> socketId

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication Error'));

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await (User as any).findById(decoded.id).lean();
      
      if (!user) return next(new Error('User not found'));
      
      socket.data.user = { id: user._id.toString(), tenantId: user.tenantId?.toString(), role: user.role };
      next();
    } catch (err) {
      next(new Error('Authentication Error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'User:', socket.data.user.id);
    
    // Store user connection
    connectedUsers.set(socket.data.user.id, socket.id);
    
    // Join tenant room
    if (socket.data.user.tenantId) {
      socket.join(`tenant_${socket.data.user.tenantId}`);
    }

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      connectedUsers.delete(socket.data.user.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const getUserSocketId = (userId: string) => {
  return connectedUsers.get(userId);
};
