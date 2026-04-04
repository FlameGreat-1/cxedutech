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
  primary: '#154c21', // toke-green
  secondary: '#5a9b5a', // green
  accent: '#ff6b00', // vibrant orange
  bg: '#f8f8f6', // panel-warm backdrop
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
  <!-- Preheader -->
  <div style="display:none;max-height:0px;overflow:hidden;">${preheader}</div>
  
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${THEME.bg};padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:${THEME.boxBg};border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Header Layout -->
          <tr>
            <td align="center" style="background-color:${THEME.primary};padding:30px 20px;text-align:center;">
              <img src="cid:logoWhite" alt="Inflexa Logo" width="160" style="max-height:60px;width:auto;display:inline-block;margin:0;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <!-- Content Layout -->
          <tr>
            <td style="padding:40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer Layout -->
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid ${THEME.border};padding:30px;text-align:center;">
              <h4 style="margin:0 0 10px 0;color:${THEME.primary};font-size:16px;">Inflexa Technologies Limited</h4>
              <p style="margin:0 0 6px 0;font-size:13px;color:${THEME.muted};">
                <strong>Registered Office:</strong><br>128, City Road, London, EC1V 2NX, UNITED KINGDOM
              </p>
              <p style="margin:0 0 6px 0;font-size:13px;color:${THEME.muted};">
                <strong>Email:</strong> <a href="mailto:inflexatechnologies@gmail.com" style="color:${THEME.secondary};text-decoration:none;">inflexatechnologies@gmail.com</a>
              </p>
              <p style="margin:0 0 16px 0;font-size:13px;color:${THEME.muted};">
                <strong>Website:</strong> <a href="https://www.inflexatechnologies.co.uk" style="color:${THEME.secondary};text-decoration:none;">www.inflexatechnologies.co.uk</a> | <a href="https://www.inflexatechnologies.com" style="color:${THEME.secondary};text-decoration:none;">www.inflexatechnologies.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
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
          <td style="padding:16px 12px;border-bottom:1px solid ${THEME.border};font-size:14px;color:${THEME.text};">${item.product_title || `Product #${item.product_id}`}</td>
          <td style="padding:16px 12px;border-bottom:1px solid ${THEME.border};text-align:center;font-size:14px;color:${THEME.muted};">${item.quantity}</td>
          <td style="padding:16px 12px;border-bottom:1px solid ${THEME.border};text-align:right;font-size:14px;color:${THEME.muted};">${symbol}${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding:16px 12px;border-bottom:1px solid ${THEME.border};text-align:right;font-size:14px;font-weight:600;color:${THEME.text};">${symbol}${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');
}

export async function sendOrderConfirmation(
  order: IOrder,
  items: IOrderItem[]
): Promise<void> {
  const total = formatPrice(Number(order.total_amount), order.currency);

  const content = `
    <h2 style="margin:0 0 20px 0;font-size:24px;color:${THEME.primary};">Order Confirmation</h2>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${order.shipping_name},</p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;">Thank you for your business. Your order <strong>#${order.id}</strong> has been successfully processed. Below are the details of your transaction.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;border:1px solid ${THEME.border};border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th style="padding:12px;text-align:left;font-size:13px;color:${THEME.muted};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid ${THEME.border};">Product</th>
          <th style="padding:12px;text-align:center;font-size:13px;color:${THEME.muted};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid ${THEME.border};">Qty</th>
          <th style="padding:12px;text-align:right;font-size:13px;color:${THEME.muted};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid ${THEME.border};">Price</th>
          <th style="padding:12px;text-align:right;font-size:13px;color:${THEME.muted};text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid ${THEME.border};">Total</th>
        </tr>
      </thead>
      <tbody>${buildItemsHtml(items, order.currency)}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:16px 12px;text-align:right;font-size:16px;color:${THEME.muted};"><strong>Grand Total</strong></td>
          <td style="padding:16px 12px;text-align:right;font-size:18px;font-weight:700;color:${THEME.primary};">${total}</td>
        </tr>
      </tfoot>
    </table>

    <h3 style="margin:0 0 12px 0;font-size:16px;color:${THEME.primary};text-transform:uppercase;letter-spacing:0.5px;">Shipping Destination</h3>
    <div style="background-color:#f9fafb;padding:16px;border-radius:8px;border:1px solid ${THEME.border};font-size:15px;line-height:24px;color:${THEME.text};">
      <strong>${order.shipping_name}</strong><br>
      ${order.shipping_address_line1}${order.shipping_address_line2 ? '<br>' + order.shipping_address_line2 : ''}<br>
      ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
      ${order.shipping_country}
    </div>

    <p style="margin:24px 0 0 0;font-size:15px;line-height:24px;color:${THEME.muted};">We will notify you with tracking information as soon as your order leaves our facility. If you have any questions, simply reply to this email.</p>
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
    <h2 style="margin:0 0 20px 0;font-size:24px;color:${THEME.primary};">Shipping Update</h2>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${order.shipping_name},</p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;">Great news! Your order <strong>#${order.id}</strong> has been carefully packed and successfully dispatched to your address.</p>
    
    ${order.tracking_code ? `
    <div style="margin:30px 0;padding:24px;background-color:#f9fafb;border-left:4px solid ${THEME.secondary};border-radius:0 8px 8px 0;">
      <p style="margin:0 0 8px 0;font-size:14px;color:${THEME.muted};text-transform:uppercase;letter-spacing:0.5px;">Tracking Code / Reference</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:${THEME.primary};letter-spacing:1px;">${order.tracking_code}</p>
    </div>
    ` : ''}

    <p style="margin:0 0 0 0;font-size:15px;line-height:24px;color:${THEME.muted};">You will receive an update once the package is officially marked as delivered. Safe travels to your new items!</p>
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
    <h2 style="margin:0 0 20px 0;font-size:24px;color:${THEME.primary};">It's Here!</h2>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${order.shipping_name},</p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;">This is a notification to confirm that your order <strong>#${order.id}</strong> has been marked as officially delivered.</p>
    
    <div style="margin:30px 0;padding:24px;background-color:#f9fafb;border:1px solid ${THEME.border};border-radius:8px;text-align:center;">
      <div style="margin-bottom:16px;">
        <svg fill="none" stroke="${THEME.secondary}" viewBox="0 0 24 24" width="48" height="48" style="display:inline-block;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p style="margin:0;font-size:18px;font-weight:600;color:${THEME.text};">Delivery Verified</p>
    </div>

    <p style="margin:0 0 0 0;font-size:15px;line-height:24px;color:${THEME.muted};">We sincerely hope you and your little ones thoroughly enjoy your new material. If you have any inquiries regarding your products, please don't hesitate to reach out to our dedicated support team by replying directly to this email.</p>
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
    <h2>New Contact Form Enquiry</h2>
    <p>A visitor has submitted a message through the website contact form.</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};font-weight:600;width:140px;background:${THEME.bg};">Name</td>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};font-weight:600;background:${THEME.bg};">Email</td>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};"><a href="mailto:${data.email}" style="color:${THEME.primary};">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};font-weight:600;background:${THEME.bg};">Subject</td>
        <td style="padding:10px 14px;border:1px solid ${THEME.border};">${data.subject}</td>
      </tr>
    </table>

    <h3>Message</h3>
    <div style="padding:16px;background:${THEME.bg};border-radius:8px;border:1px solid ${THEME.border};white-space:pre-wrap;line-height:1.6;">
      ${data.message.replace(/\n/g, '<br>')}
    </div>

    <p style="margin-top:20px;">You can reply directly to this email to respond to <strong>${data.firstName}</strong>.</p>
  `;

  const html = buildEmailLayout(
    `Inflexa - New Enquiry: ${data.subject}`,
    `New contact form submission from ${data.firstName} ${data.lastName}.`,
    content
  );

  await sendMailWithRetry({
    from: env.smtp.from,
    to: 'inflexatechnologies@gmail.com',
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
    <h2>We've Received Your Message</h2>
    <p>Hi ${data.firstName},</p>
    <p>Thank you for getting in touch with Inflexa. We have received your enquiry and a member of our team will respond within <strong>24 hours</strong>.</p>

    <div style="padding:16px;background:${THEME.bg};border-radius:8px;border:1px solid ${THEME.border};margin:16px 0;">
      <p style="margin:0 0 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin:0;color:${THEME.muted};white-space:pre-wrap;line-height:1.6;">${data.message.replace(/\n/g, '<br>')}</p>
    </div>

    <p>If you need to add anything to your enquiry, simply reply to this email.</p>
    <p>In the meantime, you may find answers to common questions on our <a href="${env.clientUrl}/faqs" style="color:${THEME.primary};font-weight:600;">FAQs page</a>.</p>
  `;

  const html = buildEmailLayout(
    'Inflexa - We Received Your Message',
    `Thank you for contacting Inflexa, ${data.firstName}. We will respond within 24 hours.`,
    content
  );

  await sendMailWithRetry({
    from: env.smtp.from,
    to: data.email,
    replyTo: 'inflexatechnologies@gmail.com',
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
    <h2 style="margin:0 0 20px 0;font-size:24px;color:${THEME.primary};">Password Reset Request</h2>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${username},</p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;">We received a request to access your Inflexa account. Click the button below to establish a new secure password:</p>
    
    <div style="text-align:center;margin:35px 0;">
      <a href="${resetUrl}" style="background-color:${THEME.accent};color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;letter-spacing:0.5px;">Reset Securely</a>
    </div>
    
    <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:${THEME.text};">This specialized link will expire exclusively in <strong>1 hour</strong>.</p>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:${THEME.muted};">If you did not initiate this system request, you may safely ignore this email. Your dashboard perimeter remains fully secure.</p>
    
    <div style="border-top:1px solid ${THEME.border};padding-top:20px;margin-top:20px;word-break:break-all;">
      <p style="margin:0 0 8px 0;font-size:13px;color:${THEME.muted};">If the interactive button above fails, manually navigate to this specific URL endpoint:</p>
      <a href="${resetUrl}" style="font-size:13px;color:${THEME.secondary};text-decoration:underline;">${resetUrl}</a>
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
