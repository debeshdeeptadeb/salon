import { useState, useEffect } from 'react';
import { galleryAPI, API_ORIGIN } from '../services/api';
import './Gallery.css';

export default function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            const response = await galleryAPI.getAll();
            setImages(response.data.data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (image) => {
        setLightboxImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxImage(null);
        document.body.style.overflow = 'auto';
    };

    const navigateLightbox = (direction) => {
        const currentIndex = images.findIndex(img => img.id === lightboxImage.id);
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % images.length
            : (currentIndex - 1 + images.length) % images.length;
        setLightboxImage(images[newIndex]);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <section className="gallery-page">
            {/* Page Hero */}
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-content">
                        <span className="page-badge fade-in">
                            <span className="badge-icon">✦</span>
                            <span className="badge-text">Our Work</span>
                            <span className="badge-icon">✦</span>
                        </span>
                        <h1 className="page-title fade-in-up">
                            Gallery of <span className="highlight-gold">Excellence</span>
                        </h1>
                        <p className="page-subtitle fade-in-up">
                            Witness the artistry and transformation that defines Minjal Salon.
                            Every image tells a story of beauty, confidence, and expert care.
                        </p>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="gallery-content section">
                <div className="container">
                    {images.length > 0 ? (
                        <div className="gallery-masonry">
                            {images.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="gallery-item"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() => openLightbox(image)}
                                >
                                    <img
                                        src={`${API_ORIGIN}${image.image_url}`}
                                        alt={image.caption || 'Gallery image'}
                                        loading="lazy"
                                    />
                                    <div className="gallery-overlay">
                                        <div className="overlay-content">
                                            <div className="zoom-icon">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="m21 21-4.35-4.35" />
                                                    <line x1="11" y1="8" x2="11" y2="14" />
                                                    <line x1="8" y1="11" x2="14" y2="11" />
                                                </svg>
                                            </div>
                                            {image.caption && (
                                                <p className="image-caption">{image.caption}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🖼️</div>
                            <h3>Gallery Coming Soon</h3>
                            <p>We're curating our best work to showcase here. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${API_ORIGIN}${lightboxImage.image_url}`}
                            alt={lightboxImage.caption || 'Gallery image'}
                        />
                        {lightboxImage.caption && (
                            <div className="lightbox-caption">
                                <p>{lightboxImage.caption}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
