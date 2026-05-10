import { Request, Response } from 'express';
import Notification from '../models/Notification.ts';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user._id;

    // Fetch tenant-wide notifications or user-specific notifications
    const notifications = await Notification.find({
      tenantId,
      $or: [{ userId }, { userId: { $exists: false } }, { userId: null }]
    })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    if (id === 'all') {
      const userId = req.user._id;
      await Notification.updateMany(
        { tenantId, $or: [{ userId }, { userId: { $exists: false } }, { userId: null }], isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: id, tenantId },
        { $set: { isRead: true } }
      );
    }

    res.json({ message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
