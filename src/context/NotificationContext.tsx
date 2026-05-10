import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: string;
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const data = await fetchWithAuth('/notifications');
        setNotifications(data);
      } catch (err) {
        // Soft fail for silent notification loading
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    // Connect to Socket.IO
    const newSocket = io(window.location.origin, {
      auth: { token },
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
    });

    newSocket.on('notification', (newNotification: Notification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Toast notification
      switch (newNotification.type) {
        case 'SUCCESS':
          toast.success(newNotification.title, { description: newNotification.message });
          break;
        case 'WARNING':
          toast.warning(newNotification.title, { description: newNotification.message });
          break;
        case 'ERROR':
          toast.error(newNotification.title, { description: newNotification.message });
          break;
        default:
          toast.info(newNotification.title, { description: newNotification.message });
      }

      // Native Push/Desktop Notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/icon.svg'
          });
        }
      }
    });

    setSocket(newSocket);

    // Request Notification permission for PWA
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchWithAuth(`/notifications/all/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
