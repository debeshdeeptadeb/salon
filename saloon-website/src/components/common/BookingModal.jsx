import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { settingsAPI, bookingsAPI, API_ORIGIN } from "../../services/api";
import "./BookingModal.css";

export default function BookingModal({ isOpen, onClose, service }) {
    const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
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

    // Branch options
    const branches = ["Cuttack", "Bhubaneswar", "Baripada"];

    // When opening for a service: reset form, step, and load UPI QR from Site Settings (admin upload)
    useEffect(() => {
        if (!isOpen || !service?.id) return;
        setStep(1);
        setErrors({});
        setLoading(false);
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

    // Format time for display
    const formatTime = (time) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Time slots from 8 AM to 9 PM (30-minute intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 21; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 21 && minute > 0) break;
                const time = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                slots.push({ value: time, label: formatTime(time) });
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const getMinDate = () => new Date().toISOString().split("T")[0];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
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
        if (!formData.booking_time) newErrors.booking_time = "Time is required";
        if (!formData.branch) newErrors.branch = "Branch is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Step 1 → Step 2: just validate and show payment QR
    const handleNext = (e) => {
        e.preventDefault();
        if (validateForm()) setStep(2);
    };

    // Step 2 → Step 3: save booking, show success
    const handleConfirmPaid = async () => {
        setLoading(true);
        setErrors((prev) => ({ ...prev, submit: "" }));
        try {
            await bookingsAPI.create({
                ...formData,
                service_id: service.id,
                payment_status: "pending",
            });
            setStep(3);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.message ||
                "Failed to save booking. Please try again.";
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
        setStep(1);
    };

    const handleClose = () => {
        if (!loading) { resetForm(); onClose(); }
    };

    if (!isOpen || !service) return null;

    return (
        <div className="booking-modal-overlay" onClick={handleClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose} disabled={loading}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Step indicator */}
                <div className="bm-steps">
                    {["Details", "Pay", "Done"].map((label, i) => (
                        <div key={label} className={`bm-step${step === i + 1 ? " active" : step > i + 1 ? " done" : ""}`}>
                            <div className="bm-step-num">{step > i + 1 ? "✓" : i + 1}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                <div className="modal-header">
                    {step < 3 && (
                        <>
                            <h2>{step === 1 ? "Book Your Appointment" : "Scan & Pay"}</h2>
                            <div className="service-info">
                                <h3>{service.name}</h3>
                                <div className="service-meta">
                                    <span className="price">₹{service.price}</span>
                                    <span className="duration">{service.duration} mins</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Step 1: Customer Details ── */}
                {step === 1 && (
                    <form className="booking-form" onSubmit={handleNext}>
                        <div className="form-group">
                            <label htmlFor="customer_name">Full Name <span className="required">*</span></label>
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
                                placeholder="your.email@example.com (optional)" />
                            {errors.customer_email && <span className="error-message">{errors.customer_email}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="booking_date">Date <span className="required">*</span></label>
                                <input type="date" id="booking_date" name="booking_date"
                                    value={formData.booking_date} onChange={handleChange}
                                    min={getMinDate()} className={errors.booking_date ? "error" : ""} />
                                {errors.booking_date && <span className="error-message">{errors.booking_date}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="booking_time">Time <span className="required">*</span></label>
                                <select id="booking_time" name="booking_time"
                                    value={formData.booking_time} onChange={handleChange}
                                    className={errors.booking_time ? "error" : ""}>
                                    <option value="">Select time</option>
                                    {timeSlots.map((slot) => (
                                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                                    ))}
                                </select>
                                {errors.booking_time && <span className="error-message">{errors.booking_time}</span>}
                            </div>
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

                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}
                                placeholder="Any special requests or preferences (optional)" rows="3" />
                        </div>

                        <button type="submit" className="btn-submit">
                            Next — Pay ₹{service.price} →
                        </button>
                    </form>
                )}

                {/* ── Step 2: UPI Payment ── */}
                {step === 2 && (
                    <div className="bm-payment">
                        <p className="bm-pay-sub">
                            Scan the QR below using any UPI app (GPay, PhonePe, Paytm, etc.)
                        </p>
                        <div className="bm-upi-amount">
                            Amount: <strong>₹{service.price}</strong>
                        </div>

                        {upiSettings?.upi_qr_image_url ? (
                            <div className="bm-qr-wrap">
                                <img
                                    src={`${API_ORIGIN}${upiSettings.upi_qr_image_url}`}
                                    alt="UPI Payment QR"
                                    className="bm-qr-img"
                                />
                            </div>
                        ) : (
                            <div className="bm-qr-placeholder">
                                <div className="bm-qr-icon">💳</div>
                                <p>UPI QR not set up yet.<br />Please contact the salon directly.</p>
                            </div>
                        )}

                        {upiSettings?.upi_id && (
                            <div className="bm-upi-id">
                                <span>UPI ID:</span> <strong>{upiSettings.upi_id}</strong>
                            </div>
                        )}

                        <div className="bm-pay-steps">
                            <div className="bm-pay-step">1. Open GPay / PhonePe / Paytm</div>
                            <div className="bm-pay-step">2. Scan the QR code above</div>
                            <div className="bm-pay-step">3. Pay ₹{service.price}</div>
                            <div className="bm-pay-step">4. Tap &quot;I&apos;ve Paid&quot; below</div>
                        </div>

                        {errors.submit && <div className="submit-error">{errors.submit}</div>}

                        <button className="btn-submit bm-btn-paid" onClick={handleConfirmPaid} disabled={loading}>
                            {loading ? "Confirming..." : "✅ I've Paid — Confirm Booking"}
                        </button>
                        <button className="btn-back" onClick={() => setStep(1)} disabled={loading}>
                            ← Back
                        </button>
                    </div>
                )}

                {/* ── Step 3: Success ── */}
                {step === 3 && (
                    <div className="submit-success-full">
                        <div className="success-icon-big">🎉</div>
                        <h2>Booking Confirmed!</h2>
                        <p>Thank you, <strong>{formData.customer_name}</strong>!</p>
                        <div className="bm-booking-summary">
                            <div><span>Service</span><strong>{service.name}</strong></div>
                            <div><span>Date</span><strong>{formData.booking_date}</strong></div>
                            <div><span>Time</span><strong>{formData.booking_time}</strong></div>
                            <div><span>Branch</span><strong>{formData.branch}</strong></div>
                            <div><span>Payment</span><strong className="bm-pending">Pending Verification</strong></div>
                        </div>
                        <p className="bm-success-note">
                            The salon will verify your payment and confirm your appointment shortly. 📱
                        </p>
                        <button className="btn-submit" onClick={handleClose}>Close</button>
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
