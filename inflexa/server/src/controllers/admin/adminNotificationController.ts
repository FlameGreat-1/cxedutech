import { Request, Response, NextFunction } from 'express';
import * as notificationModel from '../../models/notificationModel';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 30));
    const { notifications, total } = await notificationModel.findAll(page, limit);
    sendPaginated(res, notifications, total, page, limit);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getUnreadCount(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await notificationModel.countUnread();
    sendSuccess(res, { unread_count: count });
  } catch (error: unknown) {
    next(error);
  }
}

export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    const notification = await notificationModel.markAsRead(id);
    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }
    sendSuccess(res, notification);
  } catch (error: unknown) {
    next(error);
  }
}

export async function markAllAsRead(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await notificationModel.markAllAsRead();
    sendSuccess(res, { marked: count });
  } catch (error: unknown) {
    next(error);
  }
}
