import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { IOrder, IOrderItem } from '../types/order.types';
import { getSymbol, formatPrice } from '../utils/currency';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

function buildItemsHtml(items: IOrderItem[], currency: string): string {
  const symbol = getSymbol(currency);
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.product_title || `Product #${item.product_id}`}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${symbol}${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${symbol}${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');
}

export async function sendOrderConfirmation(
  order: IOrder,
  items: IOrderItem[]
): Promise<void> {
  const total = formatPrice(Number(order.total_amount), order.currency);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#2563eb;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;">Inflexa</h1>
        <p style="margin:4px 0 0;">Order Confirmation</p>
      </div>
      <div style="padding:20px;">
        <p>Hi ${order.shipping_name},</p>
        <p>Thank you for your order! Here are your details:</p>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;text-align:left;">Product</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Price</th>
              <th style="padding:8px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${buildItemsHtml(items, order.currency)}</tbody>
        </table>
        <p style="font-size:18px;text-align:right;"><strong>Total: ${total}</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p><strong>Shipping to:</strong></p>
        <p>${order.shipping_address_line1}${order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''}<br>
        ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
        ${order.shipping_country}</p>
        <p>We'll send you a tracking number once your order ships.</p>
        <p>Best regards,<br>The Inflexa Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Order #${order.id} Confirmed`,
    html,
  });

  logger.info(`Order confirmation email sent for order #${order.id}`);
}

export async function sendShippingConfirmation(
  order: IOrder
): Promise<void> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#2563eb;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;">Inflexa</h1>
        <p style="margin:4px 0 0;">Shipping Update</p>
      </div>
      <div style="padding:20px;">
        <p>Hi ${order.shipping_name},</p>
        <p>Your order <strong>#${order.id}</strong> has been shipped!</p>
        ${order.tracking_code ? `<p><strong>Tracking Code:</strong> ${order.tracking_code}</p>` : ''}
        <p>Best regards,<br>The Inflexa Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Order #${order.id} Shipped`,
    html,
  });

  logger.info(`Shipping confirmation email sent for order #${order.id}`);
}

export async function sendDeliveryConfirmation(
  order: IOrder
): Promise<void> {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#16a34a;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;">Inflexa</h1>
        <p style="margin:4px 0 0;">Delivery Confirmation</p>
      </div>
      <div style="padding:20px;">
        <p>Hi ${order.shipping_name},</p>
        <p>Great news! Your order <strong>#${order.id}</strong> has been delivered.</p>
        <p>We hope you and your little ones enjoy the flashcards! If you have any questions or feedback, please don't hesitate to reach out.</p>
        <p>Best regards,<br>The Inflexa Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Order #${order.id} Delivered`,
    html,
  });

  logger.info(`Delivery confirmation email sent for order #${order.id}`);
}
