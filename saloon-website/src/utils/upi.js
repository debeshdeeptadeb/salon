/**
 * NPCI UPI deep-link helpers for amount-specific QR and app launch.
 * @see https://www.npci.org.in/what-we-do/upi/product-overview
 */

export function formatUpiAmount(price) {
    const num = Number.parseFloat(String(price).replace(/[^\d.]/g, ""));
    if (Number.isNaN(num) || num <= 0) return "0.00";
    return num.toFixed(2);
}

export function formatDisplayPrice(price) {
    const num = Number.parseFloat(String(price).replace(/[^\d.]/g, ""));
    if (Number.isNaN(num)) return String(price);
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Build a UPI payment URI with pre-filled amount and note.
 */
export function buildUpiPayUrl({ upiId, payeeName, amount, note }) {
    if (!upiId?.trim()) return null;

    const params = new URLSearchParams();
    params.set("pa", upiId.trim());
    if (payeeName?.trim()) params.set("pn", payeeName.trim().slice(0, 50));
    params.set("am", formatUpiAmount(amount));
    params.set("cu", "INR");
    if (note?.trim()) params.set("tn", note.trim().slice(0, 80));

    return `upi://pay?${params.toString()}`;
}

/** Generic UPI app launcher (works on mobile; desktop may show app picker). */
export function buildUpiAppUrl(upiPayUrl) {
    if (!upiPayUrl) return null;
    return upiPayUrl;
}
