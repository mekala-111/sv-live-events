import { prisma } from '../lib/prisma.js';

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateBookingCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `SV-${randomCode()}`;
    const existing = await prisma.booking.findUnique({ where: { bookingCode: code } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique booking code');
}

export function generateStreamKey(): string {
  return `stream_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `INV-${year}-${seq}`;
}
