import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { settingsAPI, bookingsAPI } from "../../services/api";
import PaymentStep from "./PaymentStep";
import {
    formatTimeLabel,
    getMinBookingDate,
    getSelectableSlots,
    isDateInPast,
    isSlotInPast,
} from "../../utils/bookingSlots";
import "./BookingModal.css";

export default function BookingModal({ isOpen, onClose, service }) {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("upi_online");
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        booking_date: "",
        booking_time: "",
        branch: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [upiSettings, setUpiSettings] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [whatsappURLs, setWhatsappURLs] = useState(null);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [nowTick, setNowTick] = useState(() => Date.now());

    const branches = ["Cuttack", "Bhubaneswar", "Baripada"];
    const serviceDuration = Number(service?.duration) || 30;

    const timeSlots = useMemo(
        () => getSelectableSlots(formData.booking_date, bookedTimes, new Date(nowTick)),
        [formData.booking_date, bookedTimes, nowTick]
    );

    useEffect(() => {
        if (!isOpen) return undefined;
        const id = window.setInterval(() => setNowTick(Date.now()), 60_000);
        return () => window.clearInterval(id);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !service?.id) return;
        setStep(1);
        setPaymentMethod("upi_online");
        setErrors({});
        setLoading(false);
        setBookingId(null);
        setWhatsappURLs(null);
        setBookedTimes([]);
        setNowTick(Date.now());
        setFormData({
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            booking_date: "",
            booking_time: "",
            branch: "",
            notes: "",
        });
        settingsAPI
            .getSettings()
            .then((res) => setUpiSettings(res.data.data))
            .catch(() => setUpiSettings(null));
    }, [isOpen, service?.id]);

    useEffect(() => {
        if (!formData.booking_date || !formData.branch || !service?.id) {
            setBookedTimes([]);
            return;
        }

        let cancelled = false;
        setLoadingSlots(true);
        bookingsAPI
            .getAvailability({
                date: formData.booking_date,
                branch: formData.branch,
                duration: serviceDuration,
            })
            .then((res) => {
                if (!cancelled) setBookedTimes(res.data.data?.bookedTimes || []);
            })
            .catch(() => {
                if (!cancelled) setBookedTimes([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingSlots(false);
            });

        return () => {
            cancelled = true;
        };
    }, [formData.booking_date, formData.branch, service?.id, serviceDuration]);

    useEffect(() => {
        if (!formData.booking_time) return;
        const selected = timeSlots.find((s) => s.value === formData.booking_time);
        if (selected?.disabled) {
            setFormData((prev) => ({ ...prev, booking_time: "" }));
        }
    }, [timeSlots, formData.booking_time]);

    const formatTime = (time) => formatTimeLabel(time);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === "booking_date" || name === "branch") {
                next.booking_time = "";
            }
            return next;
        });
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (name === "booking_date" || name === "branch") {
            setErrors((prev) => ({ ...prev, booking_time: "" }));
        }
    };

    const selectTime = (value) => {
        setFormData((prev) => ({ ...prev, booking_time: value }));
        if (errors.booking_time) {
            setErrors((prev) => ({ ...prev, booking_time: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_name.trim()) newErrors.customer_name = "Name is required";
        if (!formData.customer_phone.trim()) newErrors.customer_phone = "Phone number is required";
        else if (!/^[0-9]{10}$/.test(formData.customer_phone.replace(/\D/g, "")))
            newErrors.customer_phone = "Please enter a valid 10-digit phone number";
        if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email))
            newErrors.customer_email = "Please enter a valid email address";
        if (!formData.booking_date) newErrors.booking_date = "Date is required";
        else if (isDateInPast(formData.booking_date))
            newErrors.booking_date = "Please choose today or a future date";
        if (!formData.branch) newErrors.branch = "Branch is required";
        if (!formData.booking_time) newErrors.booking_time = "Time is required";
        else if (isSlotInPast(formData.booking_date, formData.booking_time))
            newErrors.booking_time = "Please choose a future time slot";
        else if (bookedTimes.includes(formData.booking_time))
            newErrors.booking_time = "This slot was just booked. Please pick another time.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const finishSuccess = (res) => {
        const booking = res.data.data;
        setBookingId(booking.id);
        if (res.data.whatsappURLs) setWhatsappURLs(res.data.whatsappURLs);
        setStep(3);
    };

    const handleNext = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors((prev) => ({ ...prev, submit: "" }));
        try {
            const res = await bookingsAPI.create({
                ...formData,
                service_id: service.id,
                payment_method: paymentMethod,
                payment_status: paymentMethod === "pay_at_salon" ? "pay_at_salon" : "pending",
            });

            if (paymentMethod === "pay_at_salon") {
                finishSuccess(res);
            } else {
                setBookingId(res.data.data.id);
                if (res.data.whatsappURLs) setWhatsappURLs(res.data.whatsappURLs);
                setStep(2);
            }
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.message ||
                "Failed to reserve your slot. Please try again.";
            setErrors({ submit: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPaid = async ({ paymentReference, screenshot }) => {
        if (!bookingId) return;
        setLoading(true);
        setErrors((prev) => ({ ...prev, submit: "" }));
        try {
            const payload = new FormData();
            payload.append("customer_phone", formData.customer_phone.replace(/\D/g, ""));
            if (paymentReference) payload.append("payment_reference", paymentReference);
            if (screenshot) payload.append("payment_screenshot", screenshot);

            const res = await bookingsAPI.confirmPayment(bookingId, payload);
            if (res?.data?.whatsappURLs) setWhatsappURLs(res.data.whatsappURLs);
            setStep(3);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.message ||
                "Could not confirm payment. Please try again.";
            setErrors({ submit: msg });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customer_name: "", customer_phone: "", customer_email: "",
            booking_date: "", booking_time: "", branch: "", notes: "",
        });
        setErrors({});
        setBookingId(null);
        setWhatsappURLs(null);
        setPaymentMethod("upi_online");
        setStep(1);
    };

    const handleClose = () => {
        if (!loading) { resetForm(); onClose(); }
    };

    useEffect(() => {
        if (!isOpen) return;
        const prevBodyOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevBodyOverflow;
            document.documentElement.style.overflow = prevHtmlOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape" && !loading) {
                resetForm();
                onClose();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, loading, onClose]);

    if (!isOpen || !service) return null;

    const isPayAtSalon = paymentMethod === "pay_at_salon";
    const stepLabels = isPayAtSalon ? ["Details", "Done"] : ["Details", "Pay", "Done"];
    const displayStep = isPayAtSalon
        ? step === 1 ? 1 : 2
        : step;

    const stepTitles = {
        1: "Book Your Appointment",
        2: "Complete Payment",
        3: null,
    };

    const successPaymentLabel =
        paymentMethod === "pay_at_salon"
            ? "Pay at salon"
            : "Awaiting verification";

    return (
        <div className="booking-modal-overlay" onClick={handleClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <div className="bm-modal-accent" aria-hidden />
                <button className="modal-close" onClick={handleClose} disabled={loading} aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className={`bm-steps${isPayAtSalon ? " bm-steps--two" : ""}`}>
                    {stepLabels.map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = displayStep === stepNum;
                        const isDone = displayStep > stepNum;
                        return (
                            <div key={label} className={`bm-step${isActive ? " active" : isDone ? " done" : ""}`}>
                                <div className="bm-step-num">{isDone ? "✓" : stepNum}</div>
                                <span>{label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="modal-header">
                    {step < 3 && (
                        <>
                            <p className="bm-eyebrow">Minjal Salon · Secure booking</p>
                            <h2>{stepTitles[step]}</h2>
                            <div className="bm-service-card">
                                <div className="bm-service-card-text">
                                    <h3>{service.name}</h3>
                                    <span className="bm-service-duration">{service.duration} min session</span>
                                </div>
                                <div className="bm-service-price">₹{service.price}</div>
                            </div>
                        </>
                    )}
                </div>

                {step === 1 && (
                    <form className="booking-form" onSubmit={handleNext}>
                        <div className="form-group">
                            <label className="bm-section-label">How would you like to pay?</label>
                            <div className="bm-payment-method-options">
                                <label className={`bm-pay-option${paymentMethod === "upi_online" ? " selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="upi_online"
                                        checked={paymentMethod === "upi_online"}
                                        onChange={() => setPaymentMethod("upi_online")}
                                    />
                                    <span className="bm-pay-option-icon" aria-hidden>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                                    </span>
                                    <span className="bm-pay-option-body">
                                        <span className="bm-pay-option-title">Pay online (UPI)</span>
                                        <span className="bm-pay-option-desc">Instant QR · secure verification</span>
                                    </span>
                                </label>
                                <label className={`bm-pay-option${paymentMethod === "pay_at_salon" ? " selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="pay_at_salon"
                                        checked={paymentMethod === "pay_at_salon"}
                                        onChange={() => setPaymentMethod("pay_at_salon")}
                                    />
                                    <span className="bm-pay-option-icon" aria-hidden>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                    </span>
                                    <span className="bm-pay-option-body">
                                        <span className="bm-pay-option-title">Pay at salon</span>
                                        <span className="bm-pay-option-desc">Reserve now · pay on arrival</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <p className="bm-section-label bm-section-label--spaced">Your details</p>

                        <div className="form-group">
                            <label htmlFor="customer_name">Full name <span className="required">*</span></label>
                            <input type="text" id="customer_name" name="customer_name"
                                value={formData.customer_name} onChange={handleChange}
                                className={errors.customer_name ? "error" : ""}
                                placeholder="Enter your full name" />
                            {errors.customer_name && <span className="error-message">{errors.customer_name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer_phone">Phone Number <span className="required">*</span></label>
                            <input type="tel" id="customer_phone" name="customer_phone"
                                value={formData.customer_phone} onChange={handleChange}
                                className={errors.customer_phone ? "error" : ""}
                                placeholder="10-digit mobile number" />
                            {errors.customer_phone && <span className="error-message">{errors.customer_phone}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer_email">Email Address</label>
                            <input type="email" id="customer_email" name="customer_email"
                                value={formData.customer_email} onChange={handleChange}
                                className={errors.customer_email ? "error" : ""}
                                placeholder="For booking confirmation (recommended)" />
                            {errors.customer_email && <span className="error-message">{errors.customer_email}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="booking_date">Date <span className="required">*</span></label>
                                <input type="date" id="booking_date" name="booking_date"
                                    value={formData.booking_date} onChange={handleChange}
                                    min={getMinBookingDate()} className={errors.booking_date ? "error" : ""} />
                                {errors.booking_date && <span className="error-message">{errors.booking_date}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="branch">Branch <span className="required">*</span></label>
                                <select id="branch" name="branch"
                                    value={formData.branch} onChange={handleChange}
                                    className={errors.branch ? "error" : ""}>
                                    <option value="">Select branch</option>
                                    {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                                {errors.branch && <span className="error-message">{errors.branch}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label id="booking_time_label">
                                Time <span className="required">*</span>
                                <span className="bm-label-hint">
                                    {serviceDuration}-min session · 30-min slots
                                </span>
                            </label>
                            {!formData.booking_date || !formData.branch ? (
                                <p className="bm-slots-placeholder">Select date and branch to see available times</p>
                            ) : loadingSlots ? (
                                <p className="bm-slots-placeholder">Checking availability…</p>
                            ) : (
                                <>
                                    <div
                                        className={`bm-slot-grid${errors.booking_time ? " has-error" : ""}`}
                                        role="listbox"
                                        aria-labelledby="booking_time_label"
                                    >
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.value}
                                                type="button"
                                                role="option"
                                                aria-selected={formData.booking_time === slot.value}
                                                aria-disabled={slot.disabled}
                                                disabled={slot.disabled}
                                                className={`bm-slot-chip bm-slot-chip--${slot.status}${
                                                    formData.booking_time === slot.value ? " selected" : ""
                                                }`}
                                                onClick={() => selectTime(slot.value)}
                                                title={
                                                    slot.past
                                                        ? "This time has passed"
                                                        : slot.taken
                                                            ? "Already booked"
                                                            : `Book ${slot.label}`
                                                }
                                            >
                                                {slot.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bm-slot-legend" aria-hidden>
                                        <span><i className="bm-dot available" /> Available</span>
                                        <span><i className="bm-dot booked" /> Booked</span>
                                        <span><i className="bm-dot past" /> Past</span>
                                    </div>
                                </>
                            )}
                            {errors.booking_time && <span className="error-message">{errors.booking_time}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}
                                placeholder="Preferences, allergies, or special requests (optional)" rows="3" />
                        </div>

                        {errors.submit && <div className="submit-error">{errors.submit}</div>}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading
                                ? "Reserving your slot…"
                                : isPayAtSalon
                                    ? "Confirm booking"
                                    : `Continue to pay ₹${service.price}`}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <PaymentStep
                        service={service}
                        bookingId={bookingId}
                        upiSettings={upiSettings}
                        onConfirm={handleConfirmPaid}
                        onBack={() => setStep(1)}
                        loading={loading}
                        error={errors.submit}
                    />
                )}

                {step === 3 && (
                    <div className="submit-success-full">
                        <div className="success-icon-big" aria-hidden>✓</div>
                        <h2>{isPayAtSalon ? "Booking Confirmed!" : "Booking Reserved!"}</h2>
                        <p>Thank you, <strong>{formData.customer_name}</strong></p>
                        {bookingId && (
                            <p className="bm-success-ref">
                                Reference <strong>#{bookingId}</strong>
                            </p>
                        )}
                        <div className="bm-booking-summary">
                            <div><span>Service</span><strong>{service.name}</strong></div>
                            <div><span>Date</span><strong>{formData.booking_date}</strong></div>
                            <div><span>Time</span><strong>{formatTime(formData.booking_time)}</strong></div>
                            <div><span>Branch</span><strong>{formData.branch}</strong></div>
                            <div><span>Payment</span><strong className={isPayAtSalon ? "bm-pay-at-salon" : "bm-pending"}>{successPaymentLabel}</strong></div>
                        </div>
                        <p className="bm-success-note">
                            {isPayAtSalon
                                ? `Please pay ₹${service.price} at the salon when you arrive.`
                                : "We'll verify your UPI payment (UTR + amount in our account) and confirm shortly."}
                        </p>
                        {(whatsappURLs?.adminURL || whatsappURLs?.customerURL) && (
                            <div className="bm-whatsapp-actions">
                                <button
                                    type="button"
                                    className="bm-btn-whatsapp"
                                    onClick={() => {
                                        // Open salon chat first, then customer (tap Send in each)
                                        if (whatsappURLs.adminURL) {
                                            window.open(whatsappURLs.adminURL, "_blank", "noopener,noreferrer");
                                        }
                                        if (whatsappURLs.customerURL) {
                                            window.setTimeout(() => {
                                                window.open(whatsappURLs.customerURL, "_blank", "noopener,noreferrer");
                                            }, 1500);
                                        }
                                    }}
                                >
                                    Notify salon &amp; me on WhatsApp
                                </button>
                                <p className="bm-whatsapp-hint">
                                    WhatsApp opens twice — first to the salon, then your chat. Tap <strong>Send</strong> in each.
                                </p>
                                <div className="bm-whatsapp-split">
                                    {whatsappURLs.adminURL && (
                                        <a
                                            href={whatsappURLs.adminURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bm-btn-whatsapp-secondary"
                                        >
                                            Notify salon only
                                        </a>
                                    )}
                                    {whatsappURLs.customerURL && (
                                        <a
                                            href={whatsappURLs.customerURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bm-btn-whatsapp-secondary"
                                        >
                                            My confirmation
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        <button type="button" className="btn-submit" onClick={handleClose}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
}

BookingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    service: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        duration: PropTypes.number.isRequired,
    }),
};
