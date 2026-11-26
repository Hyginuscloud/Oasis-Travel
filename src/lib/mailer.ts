export interface EnquiryEmailPayload {
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  countryOfResidence: string;
  serviceRequired: string;
  destination: string;
  preferredTravelDate: string;
  numberOfTravellers: number;
  budgetRange?: string;
  message: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function dispatchEnquiryEmails(
  payload: EnquiryEmailPayload
): Promise<{ dispatched: boolean; mode: 'smtp' | 'stored_only' }> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const from = process.env.SMTP_FROM?.trim() || `Oasis Travel Consultancy <${user || 'noreply@oasistraveldubai.com'}>`;
  const recipient = process.env.ENQUIRY_RECIPIENT_EMAIL?.trim() || 'Oasistravel46@gmail.com';

  if (!host || !user || !pass) {
    return { dispatched: false, mode: 'stored_only' };
  }

  try {
    const nodemailerMod = await import('nodemailer');
    const nodemailer = nodemailerMod.default || nodemailerMod;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const htmlBody = `
      <div style="font-family: 'DM Sans', Arial, sans-serif; color: #10243B; max-width: 640px; margin: 0 auto; border: 1px solid #e5e0d5; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #10243B; color: #FAF8F3; padding: 24px 28px;">
          <h1 style="margin: 0; font-size: 20px; color: #E4C98D;">Oasis Travel &amp; Tourism Consultancy Dubai</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #FAF8F3;">New Customer Travel Enquiry · Reference ${escapeHtml(payload.referenceNumber)}</p>
        </div>
        <div style="padding: 24px 28px; background: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #748094; width: 180px;">Full Name</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(payload.fullName)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Email Address</td><td style="padding: 8px 0;">${escapeHtml(payload.email)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Mobile / WhatsApp</td><td style="padding: 8px 0;">${escapeHtml(payload.phone)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Nationality</td><td style="padding: 8px 0;">${escapeHtml(payload.nationality)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Country of Residence</td><td style="padding: 8px 0;">${escapeHtml(payload.countryOfResidence)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Service Required</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(payload.serviceRequired)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Destination</td><td style="padding: 8px 0;">${escapeHtml(payload.destination)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Preferred Date</td><td style="padding: 8px 0;">${escapeHtml(payload.preferredTravelDate)}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Travellers</td><td style="padding: 8px 0;">${payload.numberOfTravellers}</td></tr>
            <tr><td style="padding: 8px 0; color: #748094;">Budget Range</td><td style="padding: 8px 0;">${escapeHtml(payload.budgetRange || 'Not specified')}</td></tr>
          </table>
          <div style="margin-top: 18px; padding: 14px; background: #FAF8F3; border-radius: 6px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #748094; text-transform: uppercase;">Customer Message</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
          </div>
        </div>
      </div>
    `;

    // Send notification to Oasis consultancy inbox
    await transporter.sendMail({
      from,
      to: recipient,
      replyTo: payload.email,
      subject: `[Oasis Enquiry ${payload.referenceNumber}] ${payload.serviceRequired} — ${payload.fullName}`,
      html: htmlBody,
    });

    // Send confirmation receipt to customer
    await transporter.sendMail({
      from,
      to: payload.email,
      subject: `Your Oasis Travel Enquiry Confirmation (${payload.referenceNumber})`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; color: #10243B; max-width: 600px; margin: 0 auto; border: 1px solid #e5e0d5; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10243B; color: #FAF8F3; padding: 24px 28px;">
            <h1 style="margin: 0; font-size: 20px; color: #E4C98D;">Oasis Travel &amp; Tourism Consultancy Dubai</h1>
          </div>
          <div style="padding: 24px 28px; background: #FFFFFF; font-size: 14px; line-height: 1.6;">
            <p>Dear ${escapeHtml(payload.fullName)},</p>
            <p>Thank you for contacting <strong>Oasis Travel and Tourism Consultancy Dubai</strong>. We have received your enquiry and assigned reference number <strong>${escapeHtml(payload.referenceNumber)}</strong>.</p>
            <p><strong>Requested Service:</strong> ${escapeHtml(payload.serviceRequired)}<br/>
            <strong>Destination:</strong> ${escapeHtml(payload.destination)}<br/>
            <strong>Preferred Travel Date:</strong> ${escapeHtml(payload.preferredTravelDate)}</p>
            <p>Our consultants review enquiries Monday to Saturday, 8:00 AM – 8:00 PM (Dubai GST). For urgent assistance, you may also reach us via WhatsApp or telephone at <strong>+971 52 550 9694</strong>.</p>
            <p style="font-size: 12px; color: #748094; margin-top: 20px;">Disclaimer: Visa approvals, employment placements, business licences, and official fine reviews are subject to relevant government authorities. All travel quotations are subject to confirmation.</p>
          </div>
        </div>
      `,
    });

    return { dispatched: true, mode: 'smtp' };
  } catch (error) {
    console.error('SMTP dispatch failed (enquiry still saved in Cloud SQL):', error);
    return { dispatched: false, mode: 'stored_only' };
  }
}
