/** Shared salon booking slot helpers (IST wall clock for India salons). */

export const SLOT_INTERVAL_MINUTES = 30;
export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 21;
export const MIN_LEAD_MINUTES = 15;
export const SALON_TIMEZONE = 'Asia/Kolkata';

export function normalizeTime(timeStr) {
    const [h, m] = String(timeStr).split(':');
    return `${String(h).padStart(2, '0')}:${String(m || '00').padStart(2, '0')}`;
}

export function timeToMinutes(time) {
    const [h, m] = normalizeTime(time).split(':').map((n) => parseInt(n, 10));
    return h * 60 + m;
}

export function minutesToTime(total) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateTimeSlotValues() {
    const slots = [];
    for (let hour = SLOT_START_HOUR; hour <= SLOT_END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
            if (hour === SLOT_END_HOUR && minute > 0) break;
            slots.push(minutesToTime(hour * 60 + minute));
        }
    }
    return slots;
}

export function getSalonNowParts(date = new Date()) {
    const dtf = new Intl.DateTimeFormat('en-GB', {
        timeZone: SALON_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
    const parts = {};
    for (const p of dtf.formatToParts(date)) {
        if (p.type !== 'literal') parts[p.type] = p.value;
    }
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
    };
}

export function isBookingInPast(bookingDate, bookingTime) {
    const { date: today, minutes: nowMins } = getSalonNowParts();
    if (bookingDate < today) return true;
    if (bookingDate > today) return false;
    return timeToMinutes(bookingTime) < nowMins + MIN_LEAD_MINUTES;
}

export function slotsOverlap(startA, durationA, startB, durationB) {
    const a0 = timeToMinutes(startA);
    const a1 = a0 + (Number(durationA) || SLOT_INTERVAL_MINUTES);
    const b0 = timeToMinutes(startB);
    const b1 = b0 + (Number(durationB) || SLOT_INTERVAL_MINUTES);
    return a0 < b1 && a1 > b0;
}

/**
 * Returns start times that conflict with existing bookings for a requested duration.
 */
export function buildUnavailableStarts(existingBookings, requestedDurationMins) {
    const duration = Number(requestedDurationMins) || SLOT_INTERVAL_MINUTES;
    const unavailable = [];
    for (const slot of generateTimeSlotValues()) {
        const overlaps = existingBookings.some((b) =>
            slotsOverlap(slot, duration, b.booking_time, b.duration)
        );
        if (overlaps) unavailable.push(slot);
    }
    return unavailable;
}
