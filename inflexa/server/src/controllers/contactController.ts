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

    // Send notification to the business
    await sendContactNotification(contactData);

    // Send auto-reply confirmation to the customer
    await sendContactAutoReply(contactData);

    logger.info(`Contact form submitted by ${email} (subject: ${subject})`);

    sendSuccess(res, { message: 'Your message has been sent successfully. We will get back to you shortly.' }, 200);
  } catch (error: unknown) {
    next(error);
  }
}
