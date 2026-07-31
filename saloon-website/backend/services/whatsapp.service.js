/**
 * WhatsApp Notification Service
 * Uses WhatsApp Web / wa.me deep links (user taps Send).
 * Set ADMIN_WHATSAPP in env (digits with country code, e.g. 917008085336).
 */

const ADMIN_PHONE = (process.env.ADMIN_WHATSAPP || '917008085336').replace(/\D/g, '');

const formatPhoneNumber = (phone) => {
    let cleaned = String(phone || '').replace(/\D/g, '');
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = `91${cleaned}`;
    }
    return cleaned;
};

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatTime = (time) => {
    const [hours, minutes] = String(time).split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

const paymentLines = (booking) => {
    const method = booking.payment_method || 'upi_online';
    const status = booking.payment_status || 'pending';
    const utr = booking.payment_reference?.trim();
    if (method === 'pay_at_salon' || status === 'pay_at_salon') {
        return `💳 Payment: Pay at salon`;
    }
    let line = `💳 Payment: Online UPI (${status})`;
    if (utr) line += `\n🔢 UTR / Ref: ${utr}`;
    line += `\n📌 Verify note in UPI should include: Booking ${booking.id}`;
    return line;
};

export const generateAdminMessage = (booking) => {
    const message = `🆕 *NEW BOOKING #${booking.id}*

👤 ${booking.customer_name}
📱 ${booking.customer_phone}
${booking.customer_email ? `📧 ${booking.customer_email}\n` : ''}💇 ${booking.service_name}
💰 ₹${booking.service_price}
📅 ${formatDate(booking.booking_date)}
⏰ ${formatTime(booking.booking_time)}
🏢 ${booking.branch}
${booking.notes ? `📝 ${booking.notes}\n` : ''}
${paymentLines(booking)}

Please verify payment (UTR + amount) in your UPI app, then mark Paid / Confirmed in Admin → Bookings.`;

    return encodeURIComponent(message);
};

export const generateCustomerMessage = (booking) => {
    const payNote =
        booking.payment_method === 'pay_at_salon' || booking.payment_status === 'pay_at_salon'
            ? `Please pay ₹${booking.service_price} at the salon when you arrive.`
            : `Payment submitted for verification. Keep UTR handy. Booking note: #${booking.id}`;

    const message = `✨ *BOOKING #${booking.id}*

Hi ${booking.customer_name},

Your appointment is reserved.

💇 ${booking.service_name}
💰 ₹${booking.service_price}
📅 ${formatDate(booking.booking_date)}
⏰ ${formatTime(booking.booking_time)}
🏢 ${booking.branch}

${payNote}

Thank you!`;

    return encodeURIComponent(message);
};

export const getAdminWhatsAppURL = (booking) => {
    if (!ADMIN_PHONE) return null;
    return `https://wa.me/${ADMIN_PHONE}?text=${generateAdminMessage(booking)}`;
};

export const getCustomerWhatsAppURL = (booking) => {
    const phone = formatPhoneNumber(booking.customer_phone);
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${generateCustomerMessage(booking)}`;
};

export const generateWhatsAppURLs = (booking) => ({
    adminURL: getAdminWhatsAppURL(booking),
    customerURL: getCustomerWhatsAppURL(booking),
});

export default {
    generateAdminMessage,
    generateCustomerMessage,
    getAdminWhatsAppURL,
    getCustomerWhatsAppURL,
    generateWhatsAppURLs,
};
