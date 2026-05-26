/**
 * Booking notifications via Twilio SMS and Twilio SendGrid email.
 * Skips silently when credentials are not configured.
 */

import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

function isTwilioSmsConfigured() {
    return Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
    );
}

function isSendGridConfigured() {
    return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

function formatIndianPhone(phone) {
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = `91${cleaned}`;
    if (!cleaned.startsWith('+')) cleaned = `+${cleaned}`;
    return cleaned;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatTime(timeStr) {
    const [hours, minutes] = String(timeStr).split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

export function buildBookingSmsBody(booking, service, salonName) {
    const name = salonName || 'Salon';
    const paymentNote =
        booking.payment_method === 'pay_at_salon'
            ? `Pay ₹${service.price} at the salon when you arrive.`
            : 'We will verify your online payment shortly.';

    return (
        `${name}: Booking #${booking.id} confirmed.\n` +
        `Service: ${service.name}\n` +
        `Date: ${formatDate(booking.booking_date)} ${formatTime(booking.booking_time)}\n` +
        `Branch: ${booking.branch}\n` +
        paymentNote
    );
}

export function buildBookingEmailHtml(booking, service, salonName) {
    const paymentNote =
        booking.payment_method === 'pay_at_salon'
            ? `<p>Please pay <strong>₹${service.price}</strong> at the salon when you arrive.</p>`
            : '<p>Your online payment will be verified shortly.</p>';

    return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Booking confirmed — ${salonName || 'Salon'}</h2>
      <p>Hi ${booking.customer_name},</p>
      <p>Your appointment is reserved.</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px 0;color:#666;">Reference</td><td><strong>#${booking.id}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666;">Service</td><td>${service.name}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Date</td><td>${formatDate(booking.booking_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Time</td><td>${formatTime(booking.booking_time)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Branch</td><td>${booking.branch}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Amount</td><td>₹${service.price}</td></tr>
      </table>
      ${paymentNote}
      <p style="color:#888;font-size:12px;">Thank you for choosing us.</p>
    </div>`;
}

let twilioClient = null;

function getTwilioClient() {
    if (!twilioClient && isTwilioSmsConfigured()) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioClient;
}

export async function sendBookingSms(booking, service, salonName) {
    if (!isTwilioSmsConfigured()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('[notifications] SMS skipped (Twilio not configured)');
        }
        return { sent: false, reason: 'not_configured' };
    }

    try {
        const client = getTwilioClient();
        const to = formatIndianPhone(booking.customer_phone);
        const body = buildBookingSmsBody(booking, service, salonName);

        const payload = {
            to,
            body,
        };

        if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
            payload.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        } else {
            payload.from = process.env.TWILIO_PHONE_NUMBER;
        }

        await client.messages.create(payload);
        return { sent: true };
    } catch (err) {
        console.error('[notifications] SMS failed:', err.message);
        return { sent: false, reason: err.message };
    }
}

export async function sendBookingEmail(booking, service, salonName) {
    if (!booking.customer_email?.trim()) {
        return { sent: false, reason: 'no_email' };
    }

    if (!isSendGridConfigured()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('[notifications] Email skipped (SendGrid not configured)');
        }
        return { sent: false, reason: 'not_configured' };
    }

    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
            to: booking.customer_email.trim(),
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: salonName || 'Salon Booking',
            },
            subject: `Booking confirmed #${booking.id} — ${salonName || 'Salon'}`,
            html: buildBookingEmailHtml(booking, service, salonName),
        });
        return { sent: true };
    } catch (err) {
        console.error('[notifications] Email failed:', err.message);
        return { sent: false, reason: err.message };
    }
}

/**
 * Fire-and-forget booking notifications (SMS + email).
 */
export async function notifyBookingCreated(booking, service, salonName) {
    const results = await Promise.allSettled([
        sendBookingSms(booking, service, salonName),
        sendBookingEmail(booking, service, salonName),
    ]);
    return {
        sms: results[0].status === 'fulfilled' ? results[0].value : { sent: false },
        email: results[1].status === 'fulfilled' ? results[1].value : { sent: false },
    };
}

export async function notifyPaymentSubmitted(booking, service, salonName) {
    if (!isTwilioSmsConfigured()) return;

    try {
        const client = getTwilioClient();
        const to = formatIndianPhone(booking.customer_phone);
        const body =
            `${salonName || 'Salon'}: Payment received for booking #${booking.id}. ` +
            `We are verifying and will confirm your appointment soon.`;

        const payload = { to, body };
        if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
            payload.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        } else {
            payload.from = process.env.TWILIO_PHONE_NUMBER;
        }

        await client.messages.create(payload);
    } catch (err) {
        console.error('[notifications] Payment SMS failed:', err.message);
    }
}
