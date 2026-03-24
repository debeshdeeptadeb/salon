import { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import './About.css';

export default function About() {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await contentAPI.getAbout();
            setContent(response.data.data);
        } catch (error) {
            console.error('Error fetching about content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <section className="about-page">
            {/* Page Hero */}
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-content">
                        <span className="page-badge fade-in">
                            <span className="badge-icon">✦</span>
                            <span className="badge-text">Our Story</span>
                            <span className="badge-icon">✦</span>
                        </span>
                        <h1 className="page-title fade-in-up">
                            About <span className="highlight-gold">Minjal Salon</span>
                        </h1>
                        <p className="page-subtitle fade-in-up">
                            {content.about?.content || 'Where elegance meets expert care. Experience world-class beauty and grooming services in Bhubaneswar\'s premier luxury salon.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* About Content */}
            <div className="about-content section">
                <div className="container">
                    {/* Brand Story */}
                    <div className="content-section fade-in-up">
                        <div className="section-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h2 className="section-title">{content.brand_story?.title || 'Our Story'}</h2>
                        <p className="section-text">
                            {content.brand_story?.content || 'Founded with a passion for beauty and excellence, Minjal Salon has been serving the community with dedication and expertise. Our journey began with a simple vision: to create a space where elegance meets expert care.'}
                        </p>
                    </div>

                    {/* Philosophy */}
                    <div className="content-section philosophy fade-in-up">
                        <div className="section-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <h2 className="section-title">{content.philosophy?.title || 'Our Philosophy'}</h2>
                        <p className="section-text">
                            {content.philosophy?.content || 'We believe in personalized care, using only the finest products and techniques. Every client is unique, and we tailor our services to meet individual needs and preferences.'}
                        </p>
                    </div>

                    {/* Owner Section */}
                    <div className="content-section owner fade-in-up">
                        <div className="section-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h2 className="section-title">{content.owner?.title || 'Meet Our Founder'}</h2>
                        <p className="section-text">
                            {content.owner?.content || 'Our founder brings years of experience in the beauty industry, with a commitment to excellence and customer satisfaction. The vision is to make every visit a memorable experience.'}
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="values-section">
                        <h2 className="values-title">Why Choose Minjal Salon</h2>
                        <div className="values-grid">
                            <div className="value-card fade-in">
                                <div className="value-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <h3>Expert Team</h3>
                                <p>Highly trained professionals with years of experience in beauty and grooming</p>
                            </div>

                            <div className="value-card fade-in">
                                <div className="value-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3>Premium Products</h3>
                                <p>Only the finest international brands for exceptional results</p>
                            </div>

                            <div className="value-card fade-in">
                                <div className="value-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h3>Quality Service</h3>
                                <p>Personalized care tailored to your unique needs and preferences</p>
                            </div>

                            <div className="value-card fade-in">
                                <div className="value-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </div>
                                <h3>Customer First</h3>
                                <p>Your satisfaction and comfort are our top priorities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="about-cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Experience Luxury?</h2>
                        <p>Visit us today and discover why Minjal Salon is Bhubaneswar's premier beauty destination</p>
                        <div className="cta-buttons">
                            <a
                                href="https://wa.me/919337720521"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary btn-lg"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>Book Appointment</span>
                            </a>
                            <a href="/contact" className="btn-secondary btn-lg">
                                <span>Contact Us</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
