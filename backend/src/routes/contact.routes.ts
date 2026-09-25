import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/connection.js';
import { contactMessages } from '../db/schema.js';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler.js';
import { persistentRateLimit } from '../middleware/rateLimiter.js';

const router = Router();
const contactRateLimiter = persistentRateLimit({ name: 'contact', windowMs: 15 * 60 * 1000, max: 10 });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional().default(''),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

router.post('/', contactRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = contactSchema.parse(req.body);
    if (parsed.website) {
      res.status(202).json({ success: true, message: 'Message accepted.' });
      return;
    }

    await db.insert(contactMessages).values({
      sender_name: parsed.name,
      sender_email: parsed.email,
      message: parsed.message,
      ai_screening_passed: false,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
    const sendingDomain = process.env.SYSTEM_SENDING_DOMAIN || 'onboarding@resend.dev';

    if (resendApiKey && receiverEmail) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: sendingDomain,
          to: receiverEmail,
          subject: `[FlowSync] New Contact Message from ${parsed.name}`,
          html: `<p><strong>From:</strong> ${escapeHtml(parsed.name)} (${escapeHtml(parsed.email)})</p><p>${escapeHtml(parsed.message)}</p>`
        });
      } catch (emailErr) {
        console.error('[RESEND_DISPATCH_ERROR]', emailErr);
      }
    }

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0]?.message || 'Invalid contact request', 400));
      return;
    }
    next(error);
  }
});

export default router;
