import { useState } from 'react';
import { enquiriesAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await enquiriesAPI.submit(formData);
            toast.success('Thank you! We will contact you soon.');
            setFormData({ name: '', phone: '', email: '', message: '' });
        } catch (error) {
            toast.error('Failed to submit enquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="contact-page">
            {/* Page Hero */}
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-content">
                        <span className="page-badge fade-in">
                            <span className="badge-icon">✦</span>
                            <span className="badge-text">Contact Us</span>
                            <span className="badge-icon">✦</span>
                        </span>
                        <h1 className="page-title fade-in-up">
                            Get In <span className="highlight-gold">Touch</span>
                        </h1>
                        <p className="page-subtitle fade-in-up">
                            We'd love to hear from you. Reach out for appointments, enquiries,
                            or just to say hello.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Content */}
            <div className="contact-content section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Info Cards */}
                        <div className="contact-info">
                            <div className="info-card fade-in">
                                <div className="info-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <h3>Visit Us</h3>
                                <p>Minjal Salon<br />Bhubaneswar, Odisha<br />India</p>
                            </div>

                            <div className="info-card fade-in">
                                <div className="info-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <h3>Call Us</h3>
                                <a href="tel:+919337720521" className="contact-link">
                                    +91 93377 20521
                                </a>
                            </div>

                            <div className="info-card fade-in">
                                <div className="info-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <h3>WhatsApp</h3>
                                <a
                                    href="https://wa.me/919337720521"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-link"
                                >
                                    Chat with us
                                </a>
                            </div>

                            <div className="info-card fade-in">
                                <div className="info-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <h3>Working Hours</h3>
                                <p>Monday - Sunday<br />10:00 AM - 8:00 PM</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-wrapper fade-in">
                            <h2>Send Us a Message</h2>
                            <p className="form-description">
                                Fill out the form below and we'll get back to you as soon as possible
                            </p>

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Your Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Tell us how we can help you..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary btn-lg submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
                <div className="container">
                    <h2 className="map-title">Find Us on the Map</h2>
                    <div className="map-wrapper">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.41709515294!2d85.73878!3d20.2960587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sBhubaneswar%2C%20Odisha!5e0!3m2!1sen!2sin!4v1234567890"
                            width="100%"
                            height="500"
                            style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Minjal Salon Location"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
}
