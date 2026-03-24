import { useState, useEffect } from 'react';
import { catalogueAPI, API_ORIGIN } from '../services/api';
import './Catalogue.css';

export default function Catalogue() {
    const [catalogueItems, setCatalogueItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchCatalogueItems();
    }, []);

    const fetchCatalogueItems = async () => {
        try {
            const response = await catalogueAPI.getAll();
            setCatalogueItems(response.data.data);
        } catch (error) {
            console.error('Error fetching catalogue:', error);
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
        <section className="catalogue-page">
            {/* Page Hero */}
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-content">
                        <span className="page-badge fade-in">
                            <span className="badge-icon">✦</span>
                            <span className="badge-text">Service Catalogue</span>
                            <span className="badge-icon">✦</span>
                        </span>
                        <h1 className="page-title fade-in-up">
                            Curated <span className="highlight-gold">Excellence</span>
                        </h1>
                        <p className="page-subtitle fade-in-up">
                            Explore our handpicked selection of premium beauty and grooming services,
                            each designed to deliver exceptional results
                        </p>
                    </div>
                </div>
            </div>

            {/* Catalogue Grid */}
            <div className="catalogue-content section">
                <div className="container">
                    <div className="catalogue-masonry">
                        {catalogueItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="catalogue-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => setSelectedItem(item)}
                            >
                                {item.image_url && (
                                    <div className="catalogue-image">
                                        <img
                                            src={`${API_ORIGIN}${item.image_url}`}
                                            alt={item.title}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay">
                                            <div className="overlay-icon">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="m21 21-4.35-4.35" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="catalogue-content-card">
                                    <h3 className="catalogue-title">{item.title}</h3>
                                    <p className="catalogue-description">{item.description}</p>

                                    <div className="catalogue-meta">
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span>{item.duration} mins</span>
                                        </div>
                                        <div className="meta-price">
                                            ₹{item.price}
                                        </div>
                                    </div>
                                </div>

                                <div className="catalogue-corner"></div>
                            </div>
                        ))}
                    </div>

                    {catalogueItems.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No Services Available</h3>
                            <p>Our catalogue is being updated. Please check back soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="catalogue-cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Interested in Our Services?</h2>
                        <p>Contact us to learn more or book your appointment today</p>
                        <a
                            href="https://wa.me/919337720521"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary btn-lg"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>Get in Touch</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
