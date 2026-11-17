import nodemailer from 'nodemailer';
import type { ProjectEnquiryRecord } from './db.ts';

export interface EmailDispatchResult {
  sent: boolean;
  reason?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendAdminEnquiryNotification(
  enquiry: ProjectEnquiryRecord
): Promise<EmailDispatchResult> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const recipient =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    'qubex.tech.solutions@gmail.com';
  const fromAddress =
    process.env.SMTP_FROM?.trim() ||
    user ||
    'no-reply@qubextechsolutions.com';

  if (!host || !user || !pass) {
    return {
      sent: false,
      reason: 'SMTP credentials are not configured in environment variables.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    const referenceCode = `QB-${String(enquiry.id).padStart(5, '0')}`;
    const submittedFormatted = new Date(enquiry.created_at).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }
    );

    const subject = `New Project Enquiry (${referenceCode}) · ${enquiry.service_required} — ${enquiry.full_name}`;

    const textBody = [
      'Qubex Tech Solutions — New Project Enquiry',
      '==========================================',
      `Reference ID: ${referenceCode}`,
      `Submission Date & Time: ${submittedFormatted} IST`,
      `Full Name: ${enquiry.full_name}`,
      `Email Address: ${enquiry.email}`,
      `Phone Number: ${enquiry.phone}`,
      `Company Name: ${enquiry.company_name || 'Not provided'}`,
      `Service Required: ${enquiry.service_required}`,
      `Status: ${enquiry.status}`,
    ].join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; max-width: 640px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0F172A; color: #FFFFFF; padding: 20px 24px;">
          <div style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #93C5FD; font-weight: 600;">Qubex Tech Solutions</div>
          <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 700;">New Project Enquiry Received</h1>
        </div>
        <div style="padding: 24px; background-color: #FFFFFF;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
            Reference <strong style="color: #0F172A;">${escapeHtml(referenceCode)}</strong> · Submitted on ${escapeHtml(submittedFormatted)} IST
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #64748B; width: 160px; border-bottom: 1px solid #F1F5F9;">Full Name</td><td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #F1F5F9;">${escapeHtml(enquiry.full_name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;"><a href="mailto:${escapeHtml(enquiry.email)}" style="color: #1E40AF;">${escapeHtml(enquiry.email)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;">${escapeHtml(enquiry.phone)}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Company</td><td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;">${escapeHtml(enquiry.company_name || 'Not provided')}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Service Required</td><td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #F1F5F9;">${escapeHtml(enquiry.service_required)}</td></tr>
          </table>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Qubex Tech Solutions Website" <${fromAddress}>`,
      to: recipient,
      replyTo: enquiry.email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return { sent: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown SMTP transport error';
    console.error('[Qubex Email Notification Error]:', message);
    return {
      sent: false,
      reason: 'Email delivery failed; enquiry was safely saved to database.',
    };
  }
}
