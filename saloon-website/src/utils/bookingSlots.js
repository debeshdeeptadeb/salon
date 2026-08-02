/** Salon hours: 8:00 AM – 9:00 PM, 30-minute slots */
export const SLOT_INTERVAL_MINUTES = 30;
export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 21;
/** Minimum minutes from now before a slot can be booked */
export const MIN_LEAD_MINUTES = 15;

export function formatTimeLabel(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

export function timeToMinutes(time) {
    const [h, m] = String(time).split(':').map((n) => parseInt(n, 10) || 0);
    return h * 60 + m;
}

export function minutesToTime(total) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function getLocalDateString(date = new Date()) {
    const y = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${month}-${day}`;
}

export function getMinBookingDate() {
    return getLocalDateString(new Date());
}

export function generateTimeSlots() {
    const slots = [];
    for (let hour = SLOT_START_HOUR; hour <= SLOT_END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
            if (hour === SLOT_END_HOUR && minute > 0) break;
            const value = minutesToTime(hour * 60 + minute);
            slots.push({ value, label: formatTimeLabel(value) });
        }
    }
    return slots;
}

export function isDateInPast(dateStr) {
    if (!dateStr) return true;
    return dateStr < getLocalDateString();
}

/**
 * True if the slot start is already in the past (or within lead time) for today.
 */
export function isSlotInPast(dateStr, timeStr, now = new Date()) {
    if (!dateStr || !timeStr) return true;
    const today = getLocalDateString(now);
    if (dateStr < today) return true;
    if (dateStr > today) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_MINUTES;
    return timeToMinutes(timeStr) < nowMins;
}

/**
 * Slots usable for booking: not past, and not in bookedTimes from the API.
 */
export function getSelectableSlots(dateStr, bookedTimes = [], now = new Date()) {
    const booked = new Set(bookedTimes);
    return generateTimeSlots().map((slot) => {
        const past = isSlotInPast(dateStr, slot.value, now);
        const taken = booked.has(slot.value);
        return {
            ...slot,
            past,
            taken,
            disabled: past || taken,
            status: past ? 'past' : taken ? 'booked' : 'available',
        };
    });
}

export function slotsOverlap(startA, durationA, startB, durationB) {
    const a0 = timeToMinutes(startA);
    const a1 = a0 + (durationA || SLOT_INTERVAL_MINUTES);
    const b0 = timeToMinutes(startB);
    const b1 = b0 + (durationB || SLOT_INTERVAL_MINUTES);
    return a0 < b1 && a1 > b0;
}
