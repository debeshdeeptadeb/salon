import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrAPI, bookingsAPI, settingsAPI, API_ORIGIN } from '../services/api';
import PaymentStep from '../components/common/PaymentStep';
import { generateTimeSlots } from '../utils/bookingSlots';
import { toast } from 'react-toastify';
import './SalonQR.css';

const TIME_SLOTS = generateTimeSlots();
const TODAY = new Date().toISOString().split('T')[0];

export default function SalonQR() {
    const { qrCodeId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [upiSettings, setUpiSettings] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Booking modal state
    const [selectedService, setSelectedService] = useState(null);
    const [step, setStep] = useState(1); // 1=details, 2=payment, 3=success
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        booking_date: '',
        booking_time: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi_online');
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => { fetchData(); }, [qrCodeId]);

    const fetchData = async () => {
        try {
            const qrRes = await qrAPI.getServicesByQRCode(qrCodeId);
            const payload = qrRes.data.data;
            const slug = payload?.salon?.slug;
            if (slug) {
                localStorage.setItem('publicSalonSlug', slug);
            }
            const settingsRes = await settingsAPI.getSettings();
            setData(payload);
            setUpiSettings(settingsRes.data.data);
        } catch {
            toast.error('QR Code not found or inactive');
            setTimeout(() => navigate('/'), 3000);
        } finally {
            setLoading(false);
        }
    };

    const qrBranch = data?.qrCode?.label || 'Walk-in';

    useEffect(() => {
        if (!formData.booking_date || !selectedService) {
            setBookedTimes([]);
            return;
        }
        let cancelled = false;
        setLoadingSlots(true);
        bookingsAPI
            .getAvailability({ date: formData.booking_date, branch: qrBranch })
            .then((res) => {
                if (!cancelled) setBookedTimes(res.data.data?.bookedTimes || []);
            })
            .catch(() => {
                if (!cancelled) setBookedTimes([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingSlots(false);
            });
        return () => { cancelled = true; };
    }, [formData.booking_date, selectedService, qrBranch]);

    const openBooking = (service) => {
        setSelectedService(service);
        setStep(1);
        setPaymentMethod('upi_online');
        setBookingId(null);
        setSubmitError('');
        setBookedTimes([]);
        setFormData({ customer_name: '', customer_phone: '', booking_date: '', booking_time: '' });
        setErrors({});
    };

    const closeBooking = () => {
        if (submitting) return;
        setSelectedService(null);
        setStep(1);
    };

    const validate = () => {
        const newErr = {};
        if (!formData.customer_name.trim()) newErr.customer_name = 'Name is required';
        if (!formData.customer_phone.trim()) newErr.customer_phone = 'Phone is required';
        else if (!/^\d{10}$/.test(formData.customer_phone.replace(/\D/g, '')))
            newErr.customer_phone = 'Enter a valid 10-digit number';
        if (!formData.booking_date) newErr.booking_date = 'Date is required';
        if (!formData.booking_time) newErr.booking_time = 'Time slot is required';
        if (bookedTimes.includes(formData.booking_time))
            newErr.booking_time = 'This slot is no longer available';
        setErrors(newErr);
        return Object.keys(newErr).length === 0;
    };

    const handleNext = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await bookingsAPI.create({
                ...formData,
                service_id: selectedService.id,
                branch: qrBranch,
                qr_source_id: qrCodeId,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'pay_at_salon' ? 'pay_at_salon' : 'pending',
            });
            setBookingId(res.data.data.id);
            if (paymentMethod === 'pay_at_salon') {
                setStep(3);
            } else {
                setStep(2);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPaid = async ({ paymentReference, screenshot }) => {
        if (!bookingId) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload = new FormData();
            payload.append('customer_phone', formData.customer_phone.replace(/\D/g, ''));
            if (paymentReference) payload.append('payment_reference', paymentReference);
            if (screenshot) payload.append('payment_screenshot', screenshot);
            await bookingsAPI.confirmPayment(bookingId, payload);
            setStep(3);
        } catch (err) {
            setSubmitError(err.response?.data?.error || 'Could not confirm payment.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render loading / error ──────────────────────────────────────
    if (loading) {
        return (
            <div className="sqr-page">
                <div className="sqr-loading">
                    <div className="sqr-spinner"></div>
                    <p>Loading salon...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="sqr-page">
                <div className="sqr-error">
                    <div className="sqr-error-icon">❌</div>
                    <h2>QR Code Not Found</h2>
                    <p>This QR code is invalid or has been deactivated.</p>
                    <button onClick={() => navigate('/')} className="sqr-btn-primary">Go to Home</button>
                </div>
            </div>
        );
    }

    const categories = [...new Set(data.services.map(s => s.category_name))].filter(Boolean);
    const filteredServices = selectedCategory === 'all'
        ? data.services
        : data.services.filter(s => s.category_name === selectedCategory);

    return (
        <div className="sqr-page">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="sqr-header">
                <div className="sqr-header-inner">
                    {data.salon.logo && (
                        <img
                            src={`${API_ORIGIN}${data.salon.logo}`}
                            alt={data.salon.name}
                            className="sqr-logo"
                            onError={e => e.target.style.display = 'none'}
                        />
                    )}
                    <div>
                        <h1 className="sqr-salon-name">{data.salon.name}</h1>
                        <p className="sqr-tagline">{data.salon.tagline}</p>
                    </div>
                </div>
                {data.qrCode.label && (
                    <span className="sqr-location-badge">📍 {data.qrCode.label}</span>
                )}
            </div>

            {/* ── Welcome ────────────────────────────────────── */}
            <div className="sqr-welcome">
                <h2>Welcome! 👋</h2>
                <p>Browse our services and book your appointment instantly</p>
            </div>

            {/* ── Category Filter ───────────────────────────── */}
            {categories.length > 0 && (
                <div className="sqr-filter">
                    <button
                        className={`sqr-filter-btn${selectedCategory === 'all' ? ' active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >All</button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`sqr-filter-btn${selectedCategory === cat ? ' active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >{cat}</button>
                    ))}
                </div>
            )}

            {/* ── Services Grid ─────────────────────────────── */}
            <div className="sqr-grid">
                {filteredServices.length === 0 ? (
                    <div className="sqr-empty"><p>No services in this category</p></div>
                ) : filteredServices.map(service => (
                    <div key={service.id} className="sqr-card">
                        {service.image_url && (
                            <div className="sqr-card-img-wrap">
                                <img
                                    src={`${API_ORIGIN}${service.image_url}`}
                                    alt={service.name}
                                    onError={e => e.target.style.display = 'none'}
                                />
                                {service.is_featured && <span className="sqr-featured">⭐ Featured</span>}
                            </div>
                        )}
                        <div className="sqr-card-body">
                            <div className="sqr-card-top">
                                <h3>{service.name}</h3>
                                {service.category_name && <span className="sqr-cat-tag">{service.category_name}</span>}
                            </div>
                            {service.description && <p className="sqr-card-desc">{service.description}</p>}
                            <div className="sqr-card-meta">
                                <span>💰 ₹{service.price}</span>
                                <span>⏱ {service.duration} mins</span>
                            </div>
                            <button className="sqr-btn-book" onClick={() => openBooking(service)}>
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Footer ────────────────────────────────────── */}
            <div className="sqr-footer">
                <p>Powered by {data.salon.name}</p>
                <button onClick={() => navigate('/')} className="sqr-btn-ghost">Visit Website</button>
            </div>

            {/* ── Booking Modal ─────────────────────────────── */}
            {selectedService && (
                <div className="sqr-modal-overlay" onClick={closeBooking}>
                    <div className="sqr-modal" onClick={e => e.stopPropagation()}>
                        <button className="sqr-modal-close" onClick={closeBooking} disabled={submitting}>✕</button>

                        {/* Step indicator */}
                        <div className="sqr-steps">
                            {['Details', 'Payment', 'Done'].map((label, i) => (
                                <div key={label} className={`sqr-step${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                                    <div className="sqr-step-num">{step > i + 1 ? '✓' : i + 1}</div>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Service summary pill */}
                        {step < 3 && (
                            <div className="sqr-service-pill">
                                <strong>{selectedService.name}</strong>
                                <span>₹{selectedService.price} · {selectedService.duration} mins</span>
                            </div>
                        )}

                        {/* ── Step 1: Customer Details ── */}
                        {step === 1 && (
                            <div className="sqr-form">
                                <h2>Your Details</h2>

                                <div className="sqr-form-group">
                                    <label>Payment option</label>
                                    <div className="sqr-pay-methods">
                                        <label className={`sqr-pay-opt${paymentMethod === 'upi_online' ? ' active' : ''}`}>
                                            <input type="radio" checked={paymentMethod === 'upi_online'} onChange={() => setPaymentMethod('upi_online')} />
                                            Pay online (UPI)
                                        </label>
                                        <label className={`sqr-pay-opt${paymentMethod === 'pay_at_salon' ? ' active' : ''}`}>
                                            <input type="radio" checked={paymentMethod === 'pay_at_salon'} onChange={() => setPaymentMethod('pay_at_salon')} />
                                            Pay at salon
                                        </label>
                                    </div>
                                </div>

                                <div className="sqr-form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={formData.customer_name}
                                        onChange={e => setFormData(p => ({ ...p, customer_name: e.target.value }))}
                                        className={errors.customer_name ? 'error' : ''}
                                    />
                                    {errors.customer_name && <span className="sqr-err">{errors.customer_name}</span>}
                                </div>

                                <div className="sqr-form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData(p => ({ ...p, customer_phone: e.target.value }))}
                                        className={errors.customer_phone ? 'error' : ''}
                                    />
                                    {errors.customer_phone && <span className="sqr-err">{errors.customer_phone}</span>}
                                </div>

                                <div className="sqr-form-row">
                                    <div className="sqr-form-group">
                                        <label>Date *</label>
                                        <input
                                            type="date"
                                            min={TODAY}
                                            value={formData.booking_date}
                                            onChange={e => setFormData(p => ({ ...p, booking_date: e.target.value }))}
                                            className={errors.booking_date ? 'error' : ''}
                                        />
                                        {errors.booking_date && <span className="sqr-err">{errors.booking_date}</span>}
                                    </div>
                                    <div className="sqr-form-group">
                                        <label>Time Slot *</label>
                                        <select
                                            value={formData.booking_time}
                                            onChange={e => setFormData(p => ({ ...p, booking_time: e.target.value }))}
                                            className={errors.booking_time ? 'error' : ''}
                                            disabled={!formData.booking_date}
                                        >
                                            <option value="">
                                                {!formData.booking_date ? 'Select date first' : loadingSlots ? 'Loading…' : 'Select time'}
                                            </option>
                                            {TIME_SLOTS.map(s => (
                                                <option key={s.value} value={s.value} disabled={bookedTimes.includes(s.value)}>
                                                    {s.label}{bookedTimes.includes(s.value) ? ' — Booked' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.booking_time && <span className="sqr-err">{errors.booking_time}</span>}
                                    </div>
                                </div>

                                <button className="sqr-btn-primary sqr-btn-full" onClick={handleNext} disabled={submitting}>
                                    {submitting
                                        ? 'Reserving…'
                                        : paymentMethod === 'pay_at_salon'
                                            ? 'Confirm booking'
                                            : `Continue to pay ₹${selectedService.price}`}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <PaymentStep
                                service={selectedService}
                                bookingId={bookingId}
                                upiSettings={upiSettings}
                                onConfirm={handleConfirmPaid}
                                onBack={() => setStep(1)}
                                loading={submitting}
                                error={submitError}
                            />
                        )}

                        {/* ── Step 3: Success ── */}
                        {step === 3 && (
                            <div className="sqr-success">
                                <div className="sqr-success-icon">🎉</div>
                                <h2>Booking Confirmed!</h2>
                                <p>Thank you, <strong>{formData.customer_name}</strong>!</p>
                                <div className="sqr-booking-summary">
                                    <div><span>Service</span><strong>{selectedService.name}</strong></div>
                                    <div><span>Date</span><strong>{formData.booking_date}</strong></div>
                                    <div><span>Time</span><strong>{formData.booking_time}</strong></div>
                                    <div><span>Payment</span>
                                        <strong className={paymentMethod === 'pay_at_salon' ? 'sqr-salon-pay-badge' : 'sqr-pending-badge'}>
                                            {paymentMethod === 'pay_at_salon' ? 'Pay at salon' : 'Pending verification'}
                                        </strong>
                                    </div>
                                </div>
                                <p className="sqr-success-note">
                                    {paymentMethod === 'pay_at_salon'
                                        ? `Pay ₹${selectedService.price} when you arrive. Confirmation sent to your phone.`
                                        : 'The salon will verify your payment and confirm your appointment shortly.'}
                                </p>
                                <button className="sqr-btn-primary" onClick={closeBooking}>
                                    Book Another Service
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
