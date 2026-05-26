export function formatTimeLabel(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

export function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 21 && minute > 0) break;
            const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({ value, label: formatTimeLabel(value) });
        }
    }
    return slots;
}
