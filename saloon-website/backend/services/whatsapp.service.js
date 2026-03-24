/**
 * WhatsApp Notification Service
 * Uses WhatsApp Web URL approach to send notifications
 */

const ADMIN_PHONE = '917008085336'; // Admin WhatsApp number

/**
 * Format phone number for WhatsApp (remove spaces, dashes, add country code if needed)
 */
const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if not present
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    return cleaned;
};

/**
 * Format date for display
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format time for display
 */
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Generate WhatsApp message for admin notification
 */
export const generateAdminMessage = (booking) => {
    const message = `🎉 *NEW BOOKING RECEIVED*

📋 *Booking Details:*
━━━━━━━━━━━━━━━━━━━━
👤 Customer: ${booking.customer_name}
📱 Phone: ${booking.customer_phone}
${booking.customer_email ? `📧 Email: ${booking.customer_email}\n` : ''}
💇 Service: ${booking.service_name}
💰 Price: ₹${booking.service_price}
📅 Date: ${formatDate(booking.booking_date)}
⏰ Time: ${formatTime(booking.booking_time)}
🏢 Branch: ${booking.branch}
${booking.notes ? `📝 Notes: ${booking.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━

🆔 Booking ID: #${booking.id}
📊 Status: ${booking.status.toUpperCase()}

Please confirm this booking at your earliest convenience.`;

    return encodeURIComponent(message);
};

/**
 * Generate WhatsApp message for customer confirmation
 */
export const generateCustomerMessage = (booking) => {
    const message = `✨ *BOOKING CONFIRMATION*

Dear ${booking.customer_name},

Thank you for choosing Minjal Salon! Your appointment has been successfully booked.

📋 *Your Appointment Details:*
━━━━━━━━━━━━━━━━━━━━
💇 Service: ${booking.service_name}
💰 Price: ₹${booking.service_price}
📅 Date: ${formatDate(booking.booking_date)}
⏰ Time: ${formatTime(booking.booking_time)}
🏢 Branch: ${booking.branch}
━━━━━━━━━━━━━━━━━━━━

🆔 Booking Reference: #${booking.id}

We look forward to serving you! If you need to reschedule or have any questions, please contact us.

Best regards,
*Minjal Salon Team* 💈`;

    return encodeURIComponent(message);
};

/**
 * Get WhatsApp URL for admin notification
 */
export const getAdminWhatsAppURL = (booking) => {
    const message = generateAdminMessage(booking);
    return `https://wa.me/${ADMIN_PHONE}?text=${message}`;
};

/**
 * Get WhatsApp URL for customer confirmation
 */
export const getCustomerWhatsAppURL = (booking) => {
    const phone = formatPhoneNumber(booking.customer_phone);
    const message = generateCustomerMessage(booking);
    return `https://wa.me/${phone}?text=${message}`;
};

/**
 * Generate both WhatsApp URLs for a booking
 */
export const generateWhatsAppURLs = (booking) => {
    return {
        adminURL: getAdminWhatsAppURL(booking),
        customerURL: getCustomerWhatsAppURL(booking)
    };
};

export default {
    generateAdminMessage,
    generateCustomerMessage,
    getAdminWhatsAppURL,
    getCustomerWhatsAppURL,
    generateWhatsAppURLs
};
