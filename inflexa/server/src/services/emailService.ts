import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { IOrder, IOrderItem } from '../types/order.types';
import { getSymbol, formatPrice } from '../utils/currency';
import { logger } from '../utils/logger';
import { logoWhiteBase64 } from '../utils/logoBase64';

const logoAttachment = {
  filename: 'logo-white.png',
  content: logoWhiteBase64,
  encoding: 'base64',
  cid: 'logoWhite'
};

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

async function sendMailWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  retries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 2_000;
      logger.warn(`Email send attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const THEME = {
  primary: '#154c21',
  secondary: '#5a9b5a',
  accent: '#ff6b00',
  bg: '#f8f8f6',
  boxBg: '#ffffff',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb'
};

function buildEmailLayout(title: string, preheader: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${THEME.bg};color:${THEME.text};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${THEME.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:${THEME.boxBg};border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:${THEME.primary};padding:24px 32px;text-align:center;">
              <img src="cid:logoWhite" alt="Inflexa" width="160" style="display:inline-block;">
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background-color:#f3f4f6;border-top:1px solid ${THEME.border};font-size:13px;color:${THEME.muted};">
              <h4 style="margin:0 0 8px 0;color:${THEME.text};">Inflexa Technologies Limited</h4>
              <p style="margin:4px 0;">
                <strong>Registered Office:</strong><br>128, City Road, London, EC1V 2NX, UNITED KINGDOM
              </p>
              <p style="margin:4px 0;">
                <strong>Email:</strong> <a href="mailto:support@inflexatechnologies.com" style="color:${THEME.primary};">support@inflexatechnologies.com</a>
              </p>
              <p style="margin:4px 0;">
                <strong>Website:</strong> <a href="https://www.inflexatechnologies.co.uk" style="color:${THEME.primary};">www.inflexatechnologies.co.uk</a> | <a href="https://www.inflexatechnologies.com" style="color:${THEME.primary};">www.inflexatechnologies.com</a>
              </p>
              <p style="margin:12px 0 0 0;">
                &copy; ${new Date().getFullYear()} Inflexa Technologies Limited. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildItemsHtml(items: IOrderItem[], currency: string): string {
  const symbol = getSymbol(currency);
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid ${THEME.border};">${item.product_title || `Product #${item.product_id}`}</td>
          <td style="padding:8px;border-bottom:1px solid ${THEME.border};text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid ${THEME.border};text-align:right;">${symbol}${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid ${THEME.border};text-align:right;">${symbol}${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');
}

function buildCostBreakdownHtml(order: IOrder): string {
  const symbol = getSymbol(order.currency);
  const subtotal = formatPrice(Number(order.subtotal), order.currency);
  const shippingCost = Number(order.shipping_cost);
  const taxAmount = Number(order.tax_amount);
  const total = formatPrice(Number(order.total_amount), order.currency);

  const shippingLabel = order.shipping_carrier && order.shipping_service
    ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
    : 'Shipping';
  const shippingValue = shippingCost > 0 ? `${symbol}${shippingCost.toFixed(2)}` : 'Free';

  const taxRate = Number(order.tax_rate);
  const taxLabel = taxRate > 0 ? `VAT (${taxRate}%)` : 'Tax';
  const taxValue = taxAmount > 0 ? `${symbol}${taxAmount.toFixed(2)}` : 'N/A';

  let html = `<tr>
    <td style="padding:8px 0;"><strong>Subtotal</strong></td>
    <td style="padding:8px 0;text-align:right;">${subtotal}</td>
  </tr>`;

  html += `<tr>
    <td style="padding:8px 0;">${shippingLabel}</td>
    <td style="padding:8px 0;text-align:right;">${shippingValue}</td>
  </tr>`;

  html += `<tr>
    <td style="padding:8px 0;">${taxLabel}</td>
    <td style="padding:8px 0;text-align:right;">${taxValue}</td>
  </tr>`;

  html += `<tr>
    <td style="padding:12px 0;border-top:2px solid ${THEME.primary};font-size:16px;"><strong>Grand Total</strong></td>
    <td style="padding:12px 0;border-top:2px solid ${THEME.primary};text-align:right;font-size:16px;"><strong>${total}</strong></td>
  </tr>`;

  return html;
}

export async function sendOrderConfirmation(
  order: IOrder,
  items: IOrderItem[]
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">Order Confirmation</h2>
    <p>Hi ${order.shipping_name},</p>
    <p>Thank you for your business. Your order <strong>#${order.id}</strong> has been successfully processed. Below are the details of your transaction.</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid ${THEME.border};">Product</th>
          <th style="text-align:center;padding:8px;border-bottom:2px solid ${THEME.border};">Qty</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid ${THEME.border};">Price</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid ${THEME.border};">Total</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsHtml(items, order.currency)}
      </tbody>
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tbody>
        ${buildCostBreakdownHtml(order)}
      </tbody>
    </table>

    <h3 style="color:${THEME.primary};margin:24px 0 8px 0;">Shipping Destination</h3>
    <div style="background-color:#f9fafb;padding:12px 16px;border-radius:6px;border:1px solid ${THEME.border};">
      <strong>${order.shipping_name}</strong><br>
      ${order.shipping_address_line1}${order.shipping_address_line2 ? '<br>' + order.shipping_address_line2 : ''}<br>
      ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
      ${order.shipping_country}
    </div>

    <p>We will notify you with tracking information as soon as your order leaves our facility. If you have any questions, simply reply to this email.</p>
  `;

  const html = buildEmailLayout(`Inflexa - Order #${order.id} Confirmed`, `Your order #${order.id} has been confirmed.`, content);

  await sendMailWithRetry({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Standard Order Receipt (#${order.id})`,
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Order confirmation email sent for order #${order.id}`);
}

export async function sendShippingConfirmation(
  order: IOrder
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">Shipping Update</h2>
    <p>Hi ${order.shipping_name},</p>
    <p>Great news! Your order <strong>#${order.id}</strong> has been carefully packed and successfully dispatched to your address.</p>
    
    ${order.tracking_code ? `
    <div style="background-color:#f0fdf4;padding:16px;border-radius:6px;border:1px solid #bbf7d0;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px 0;color:${THEME.muted};font-size:13px;">Tracking Code / Reference</p>
      <p style="margin:0;font-size:18px;font-weight:bold;color:${THEME.primary};letter-spacing:1px;">${order.tracking_code}</p>
    </div>
    ` : ''}

    <p>You will receive an update once the package is officially marked as delivered. Safe travels to your new items!</p>
  `;

  const html = buildEmailLayout(`Inflexa - Order #${order.id} Shipped`, `Your order #${order.id} is on its way!`, content);

  await sendMailWithRetry({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Your order #${order.id} has shipped`,
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Shipping confirmation email sent for order #${order.id}`);
}

export async function sendDeliveryConfirmation(
  order: IOrder
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">It's Here!</h2>
    <p>Hi ${order.shipping_name},</p>
    <p>This is a notification to confirm that your order <strong>#${order.id}</strong> has been marked as officially delivered.</p>
    
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background-color:#f0fdf4;border-radius:50%;padding:16px;">
        <span style="font-size:48px;color:${THEME.secondary};">&#10003;</span>
      </div>
      <p style="margin:8px 0 0 0;font-weight:bold;color:${THEME.secondary};">Delivery Verified</p>
    </div>

    <p>We sincerely hope you and your little ones thoroughly enjoy your new material. If you have any inquiries regarding your products, please don't hesitate to reach out to our dedicated support team by replying directly to this email.</p>
  `;

  const html = buildEmailLayout(`Inflexa - Order #${order.id} Delivered`, `Your order #${order.id} has been delivered successfully.`, content);

  await sendMailWithRetry({
    from: env.smtp.from,
    to: order.shipping_email,
    subject: `Inflexa - Tracking Update: Delivered (#${order.id})`,
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Delivery confirmation email sent for order #${order.id}`);
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(
  data: ContactFormData
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">New Contact Form Enquiry</h2>
    <p>A visitor has submitted a message through the website contact form.</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};font-weight:bold;width:100px;">Name</td>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};font-weight:bold;">Email</td>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};"><a href="mailto:${data.email}" style="color:${THEME.primary};">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};font-weight:bold;">Subject</td>
        <td style="padding:8px;border-bottom:1px solid ${THEME.border};">${data.subject}</td>
      </tr>
    </table>

    <h3 style="color:${THEME.primary};margin:16px 0 8px 0;">Message</h3>
    <div style="background-color:#f9fafb;padding:12px 16px;border-radius:6px;border:1px solid ${THEME.border};">
      ${data.message.replace(/\n/g, '<br>')}
    </div>

    <p>You can reply directly to this email to respond to <strong>${data.firstName}</strong>.</p>
  `;

  const html = buildEmailLayout(
    `Inflexa - New Enquiry: ${data.subject}`,
    `New contact form submission from ${data.firstName} ${data.lastName}.`,
    content
  );

  await sendMailWithRetry({
    from: env.smtp.from,
    to: 'support@inflexatechnologies.com',
    replyTo: data.email,
    subject: `Inflexa - New Enquiry: ${data.subject}`,
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Contact notification email sent for enquiry from ${data.email}`);
}

export async function sendContactAutoReply(
  data: ContactFormData
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">We've Received Your Message</h2>
    <p>Hi ${data.firstName},</p>
    <p>Thank you for getting in touch with Inflexa. We have received your enquiry and a member of our team will respond within <strong>24 hours</strong>.</p>

    <div style="background-color:#f9fafb;padding:12px 16px;border-radius:6px;border:1px solid ${THEME.border};margin:16px 0;">
      <p style="margin:0 0 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin:0;">${data.message.replace(/\n/g, '<br>')}</p>
    </div>

    <p>If you need to add anything to your enquiry, simply reply to this email.</p>
    <p>In the meantime, you may find answers to common questions on our <a href="${env.clientUrl}/faqs" style="color:${THEME.primary};">FAQs page</a>.</p>
  `;

  const html = buildEmailLayout(
    'Inflexa - We Received Your Message',
    `Thank you for contacting Inflexa, ${data.firstName}. We will respond within 24 hours.`,
    content
  );

  await sendMailWithRetry({
    from: env.smtp.from,
    to: data.email,
    replyTo: 'support@inflexatechnologies.com',
    subject: 'Inflexa - We Received Your Message',
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Contact auto-reply email sent to ${data.email}`);
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetUrl: string
): Promise<void> {
  const content = `
    <h2 style="color:${THEME.primary};margin:0 0 16px 0;">Password Reset Request</h2>
    <p>Hi ${username},</p>
    <p>We received a request to access your Inflexa account. Click the button below to establish a new secure password:</p>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background-color:${THEME.primary};color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Reset Securely</a>
    </div>
    
    <p>This specialized link will expire exclusively in <strong>1 hour</strong>.</p>
    <p>If you did not initiate this system request, you may safely ignore this email. Your dashboard perimeter remains fully secure.</p>
    
    <div style="background-color:#f9fafb;padding:12px 16px;border-radius:6px;border:1px solid ${THEME.border};margin:16px 0;font-size:13px;">
      <p style="margin:0 0 4px 0;">If the interactive button above fails, manually navigate to this specific URL endpoint:</p>
      <a href="${resetUrl}" style="color:${THEME.primary};word-break:break-all;">${resetUrl}</a>
    </div>
  `;

  const html = buildEmailLayout(`Inflexa - Secure Password Reset`, `Reset your Inflexa account password.`, content);

  await sendMailWithRetry({
    from: env.smtp.from,
    to: email,
    subject: 'Inflexa - Action Required: Password Reset',
    html,
    attachments: [logoAttachment],
  });

  logger.info(`Password reset email sent to ${email}`);
}
