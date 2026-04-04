import { Request, Response, NextFunction } from 'express';
import { sendContactNotification, sendContactAutoReply } from '../services/emailService';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export async function submitContact(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    const contactData = { firstName, lastName, email, subject, message };

    logger.info(`Contact form submitted by ${email} (subject: ${subject})`);

    // Respond immediately — the user should not wait for SMTP round-trips.
    sendSuccess(res, { message: 'Your message has been sent successfully. We will get back to you shortly.' }, 200);

    // Fire both emails in parallel, non-blocking (fire-and-forget).
    // If either fails, it is logged but does not affect the user response.
    Promise.all([
      sendContactNotification(contactData),
      sendContactAutoReply(contactData),
    ]).catch((err: unknown) => {
      logger.error('Failed to send contact form email(s)', err);
    });
  } catch (error: unknown) {
    next(error);
  }
}
