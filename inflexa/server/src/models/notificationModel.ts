import pool from '../config/database';
import { INotification, NotificationType } from '../types/notification.types';

export async function create(data: {
  type: NotificationType;
  title: string;
  message: string;
  order_id?: number | null;
}): Promise<INotification> {
  const { rows } = await pool.query<INotification>(
    `INSERT INTO admin_notifications (type, title, message, order_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.type, data.title, data.message, data.order_id ?? null]
  );
  return rows[0];
}

export async function findAll(
  page: number = 1,
  limit: number = 30
): Promise<{ notifications: INotification[]; total: number }> {
  const countResult = await pool.query('SELECT COUNT(*) FROM admin_notifications');
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const { rows } = await pool.query<INotification>(
    `SELECT * FROM admin_notifications
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { notifications: rows, total };
}

export async function countUnread(): Promise<number> {
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM admin_notifications WHERE is_read = FALSE'
  );
  return parseInt(rows[0].count, 10);
}

export async function markAsRead(id: number): Promise<INotification | null> {
  const { rows } = await pool.query<INotification>(
    `UPDATE admin_notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

export async function markAllAsRead(): Promise<number> {
  const result = await pool.query(
    `UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE`
  );
  return result.rowCount ?? 0;
}
