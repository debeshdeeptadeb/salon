import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import QRCode from "qrcode";
import { API_ORIGIN } from "../../services/api";
import { buildUpiPayUrl, buildUpiAppUrl, formatDisplayPrice } from "../../utils/upi";
import "./BookingModal.css";

export default function PaymentStep({
    service,
    bookingId,
    upiSettings,
    onConfirm,
    onBack,
    loading,
    error,
}) {
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [qrError, setQrError] = useState(false);
    const [paymentRef, setPaymentRef] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showRefHint, setShowRefHint] = useState(false);
    const [screenshotError, setScreenshotError] = useState("");
    const fileInputRef = useRef(null);

    const siteName = upiSettings?.site_name || "Salon";
    const upiId = upiSettings?.upi_id?.trim() || "";
    const displayAmount = formatDisplayPrice(service.price);
    const payNote = bookingId ? `Booking ${bookingId}` : service.name;

    const upiPayUrl = buildUpiPayUrl({
        upiId,
        payeeName: siteName,
        amount: service.price,
        note: payNote,
    });

    const staticQrUrl = upiSettings?.upi_qr_image_url
        ? `${API_ORIGIN}${upiSettings.upi_qr_image_url}`
        : null;

    useEffect(() => {
        let cancelled = false;
        setQrError(false);
        setQrDataUrl(null);

        if (!upiPayUrl) return;

        QRCode.toDataURL(upiPayUrl, {
            width: 240,
            margin: 2,
            color: { dark: "#1a1a1a", light: "#ffffff" },
        })
            .then((url) => {
                if (!cancelled) setQrDataUrl(url);
            })
            .catch(() => {
                if (!cancelled) setQrError(true);
            });

        return () => {
            cancelled = true;
        };
    }, [upiPayUrl]);

    useEffect(() => {
        return () => {
            if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
        };
    }, [screenshotPreview]);

    const handleCopyUpi = useCallback(async () => {
        if (!upiId) return;
        try {
            await navigator.clipboard.writeText(upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard unavailable */
        }
    }, [upiId]);

    const handleOpenUpi = () => {
        const url = buildUpiAppUrl(upiPayUrl);
        if (url) window.location.href = url;
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be under 5 MB");
            return;
        }
        setScreenshot(file);
        setScreenshotError("");
        if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
        setScreenshotPreview(URL.createObjectURL(file));
    };

    const handleConfirm = () => {
        if (!screenshot) {
            setScreenshotError("Please upload your payment screenshot to continue.");
            fileInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        onConfirm({
            paymentReference: paymentRef.trim() || undefined,
            screenshot,
        });
    };

    const qrSrc = qrDataUrl || (!qrError && staticQrUrl) || null;
    const hasPaymentMethod = Boolean(upiId || staticQrUrl);
    const canConfirm = hasPaymentMethod && Boolean(screenshot) && !loading;

    return (
        <div className="bm-payment">
            <p className="bm-payment-intro">Complete your UPI payment below, then upload proof to confirm.</p>

            {bookingId && (
                <div className="bm-booking-ref">
                    <span className="bm-ref-label">Booking reference</span>
                    <strong className="bm-ref-id">#{bookingId}</strong>
                    <span className="bm-ref-hint">Save this — we&apos;ll verify your payment against it</span>
                </div>
            )}

            <div className="bm-pay-trust">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                    Secure UPI payment to <strong>{siteName}</strong> · Amount is pre-filled
                </span>
            </div>

            <div className="bm-amount-card">
                <span className="bm-amount-label">Pay exactly</span>
                <span className="bm-amount-value">₹{displayAmount}</span>
                <span className="bm-amount-service">{service.name}</span>
            </div>

            {!hasPaymentMethod ? (
                <div className="bm-qr-placeholder bm-qr-missing">
                    <div className="bm-qr-icon" aria-hidden>⚠️</div>
                    <p>
                        Online payment is not configured yet.
                        <br />
                        Please contact the salon to complete your booking.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bm-pay-methods">
                        {qrSrc && (
                            <div className="bm-qr-section">
                                <p className="bm-qr-label">Scan with any UPI app</p>
                                <div className="bm-qr-wrap">
                                    <img src={qrSrc} alt={`Pay ₹${displayAmount} via UPI`} className="bm-qr-img" />
                                </div>
                                {upiPayUrl && (
                                    <p className="bm-qr-note">QR includes amount ₹{displayAmount}</p>
                                )}
                            </div>
                        )}

                        <div className="bm-pay-actions">
                            {upiPayUrl && (
                                <button type="button" className="bm-btn-upi-app" onClick={handleOpenUpi}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
                                    Open UPI app to pay
                                </button>
                            )}

                            {upiId && (
                                <div className="bm-upi-id-row">
                                    <div className="bm-upi-id">
                                        <span className="bm-upi-id-label">UPI ID</span>
                                        <strong>{upiId}</strong>
                                    </div>
                                    <button type="button" className="bm-btn-copy" onClick={handleCopyUpi}>
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <details className="bm-pay-help" open>
                        <summary>Step-by-step guide</summary>
                        <ol className="bm-pay-steps-list">
                            <li>Tap <strong>Pay with UPI App</strong> or scan the QR code</li>
                            <li>Confirm amount <strong>₹{displayAmount}</strong> in your app</li>
                            <li>Take a screenshot of the success screen</li>
                            <li>Upload your payment screenshot below (required)</li>
                        </ol>
                    </details>

                    <div className="bm-card bm-utr-section">
                        <label htmlFor="payment_reference">
                            UPI transaction reference <span className="bm-optional">optional</span>
                        </label>
                        <input
                            id="payment_reference"
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            placeholder="e.g. 123456789012"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            maxLength={50}
                        />
                        <button
                            type="button"
                            className="bm-utr-help"
                            onClick={() => setShowRefHint(!showRefHint)}
                        >
                            Where do I find this?
                        </button>
                        {showRefHint && (
                            <p className="bm-utr-hint">
                                After paying, open your UPI app → Transaction history → copy the 12-digit
                                UTR / Reference ID.
                            </p>
                        )}
                    </div>

                    <div className={`bm-card bm-screenshot-section${screenshotError ? " has-error" : ""}`}>
                        <label>
                            Payment screenshot <span className="bm-required">required</span>
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="bm-screenshot-input"
                            onChange={handleScreenshotChange}
                        />
                        <button
                            type="button"
                            className="bm-btn-screenshot"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {screenshot ? "Change screenshot" : "Upload payment screenshot"}
                        </button>
                        {screenshotPreview && (
                            <div className="bm-screenshot-preview">
                                <img src={screenshotPreview} alt="Payment screenshot preview" />
                            </div>
                        )}
                        <p className="bm-screenshot-hint">
                            Upload a screenshot of your GPay / PhonePe payment success screen. Required to confirm.
                        </p>
                        {screenshotError && (
                            <span className="bm-screenshot-error">{screenshotError}</span>
                        )}
                    </div>
                </>
            )}

            {error && <div className="submit-error">{error}</div>}

            <button
                type="button"
                className="btn-submit bm-btn-paid"
                onClick={handleConfirm}
                disabled={!canConfirm}
                title={!screenshot && hasPaymentMethod ? "Upload payment screenshot to continue" : undefined}
            >
                {loading ? "Confirming…" : "I've completed payment"}
            </button>

            <p className="bm-pay-footer-note">
                Payment is verified by our team within a few hours. Your slot is reserved once you confirm.
            </p>

            <button type="button" className="btn-back" onClick={onBack} disabled={loading}>
                ← Back to details
            </button>
        </div>
    );
}

PaymentStep.propTypes = {
    service: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    bookingId: PropTypes.number,
    upiSettings: PropTypes.object,
    onConfirm: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
};
