import { logger } from '../lib/logger.js';

type NotifyPayload = {
  type: 'EVENT_REMINDER' | 'STREAM_STARTED' | 'RECORDING_READY' | 'PAYMENT_SUCCESS' | 'BOOKING_CONFIRMED';
  to: { email?: string; phone?: string; whatsapp?: string };
  subject: string;
  message: string;
  meta?: Record<string, unknown>;
};

/** Channel stubs — wire Nodemailer / SMS / WhatsApp providers via env in production */
export async function notifyEvent(payload: NotifyPayload) {
  logger.info(`[notify:${payload.type}] ${payload.subject} → ${payload.to.email || payload.to.phone || 'n/a'}`);
  // Email / SMS / WhatsApp integrations are env-gated no-ops until credentials exist.
  return { queued: true, channels: ['log'] as const };
}
