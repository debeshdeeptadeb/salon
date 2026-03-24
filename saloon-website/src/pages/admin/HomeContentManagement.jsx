import { useState, useEffect } from 'react';
import {
    HiOutlineHome,
    HiOutlineSparkles,
    HiOutlinePencilSquare,
    HiOutlineChartBarSquare,
    HiOutlinePhoto,
    HiOutlineSquares2X2,
    HiOutlineCurrencyRupee,
    HiOutlineTrash,
    HiOutlinePlus,
} from 'react-icons/hi2';
import { homeContentAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';

export default function HomeContentManagement() {
    const [activeTab, setActiveTab] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Hero state
    const [heroData, setHeroData] = useState({
        badge_text: '',
        title_main: '',
        title_highlight: '',
        subtitle: '',
        stat_years: 0,
        stat_clients: 0,
        stat_services: 0
    });

    // Services state
    const [servicesData, setServicesData] = useState([]);

    // Prices state
    const [pricesData, setPricesData] = useState([]);

    useEffect(() => {
        fetchAllContent();
    }, []);

    const fetchAllContent = async () => {
        try {
            const [heroRes, servicesRes, pricesRes] = await Promise.all([
                homeContentAPI.getHero(),
                homeContentAPI.getServices(),
                homeContentAPI.getPrices()
            ]);

            setHeroData(heroRes.data.data);
            setServicesData(servicesRes.data.data);
            setPricesData(pricesRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // HERO SECTION HANDLERS
    // =============================================
    const handleHeroSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await homeContentAPI.updateHero(heroData);
            toast.success('Hero section updated successfully');
        } catch (error) {
            toast.error('Failed to update hero section');
        } finally {
            setSaving(false);
        }
    };

    // =============================================
    // SERVICES SECTION HANDLERS
    // =============================================
    const handleServiceChange = (index, field, value) => {
        const updated = [...servicesData];
        updated[index][field] = value;
        setServicesData(updated);
    };

    const handleServiceImageUpload = async (index, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await homeContentAPI.uploadServiceImage(formData);
            const imageUrl = response.data.data.imageUrl;

            const updated = [...servicesData];
            updated[index].image_url = imageUrl;
            setServicesData(updated);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
        }
    };

    const addService = () => {
        setServicesData([
            ...servicesData,
            {
                title: '',
                description: '',
                icon: '',
                image_url: '',
                display_order: servicesData.length + 1,
                is_active: true
            }
        ]);
    };

    const removeService = (index) => {
        const updated = servicesData.filter((_, i) => i !== index);
        // Update display orders
        updated.forEach((service, i) => {
            service.display_order = i + 1;
        });
        setServicesData(updated);
    };

    const handleServicesSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await homeContentAPI.updateServices({ services: servicesData });
            toast.success('Services updated successfully');
            fetchAllContent();
        } catch (error) {
            toast.error('Failed to update services');
        } finally {
            setSaving(false);
        }
    };

    // =============================================
    // PRICES SECTION HANDLERS
    // =============================================
    const handlePriceChange = (index, field, value) => {
        const updated = [...pricesData];
        updated[index][field] = value;
        setPricesData(updated);
    };

    const addPrice = () => {
        setPricesData([
            ...pricesData,
            {
                service_name: '',
                price: '',
                display_order: pricesData.length + 1,
                is_active: true
            }
        ]);
    };

    const removePrice = (index) => {
        const updated = pricesData.filter((_, i) => i !== index);
        // Update display orders
        updated.forEach((price, i) => {
            price.display_order = i + 1;
        });
        setPricesData(updated);
    };

    const handlePricesSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await homeContentAPI.updatePrices({ prices: pricesData });
            toast.success('Prices updated successfully');
            fetchAllContent();
        } catch (error) {
            toast.error('Failed to update prices');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page admin-ui-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page admin-ui-page">
            <div className="admin-ui-header">
                <h1 className="admin-page-title-row">
                    <HiOutlineHome aria-hidden />
                    Home Content
                </h1>
                <p className="admin-ui-subtitle">Manage hero, services preview, and price list for the public home page.</p>
            </div>

            <div className="admin-filter-tabs" role="tablist" aria-label="Home content sections">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'hero'}
                    className={activeTab === 'hero' ? 'active' : ''}
                    onClick={() => setActiveTab('hero')}
                >
                    <HiOutlinePhoto aria-hidden />
                    Hero
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'services'}
                    className={activeTab === 'services' ? 'active' : ''}
                    onClick={() => setActiveTab('services')}
                >
                    <HiOutlineSquares2X2 aria-hidden />
                    Services preview
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'prices'}
                    className={activeTab === 'prices' ? 'active' : ''}
                    onClick={() => setActiveTab('prices')}
                >
                    <HiOutlineCurrencyRupee aria-hidden />
                    Prices
                </button>
            </div>

            {/* Hero Tab */}
            {activeTab === 'hero' && (
                <form onSubmit={handleHeroSubmit}>
                    <div className="content-section-editor">
                        <h3 className="admin-section-title">
                            <HiOutlineSparkles aria-hidden />
                            Badge text
                        </h3>
                        <div className="form-group">
                            <label>Badge Text</label>
                            <input
                                type="text"
                                value={heroData.badge_text}
                                onChange={(e) => setHeroData({ ...heroData, badge_text: e.target.value })}
                                placeholder="Bhubaneswar's Premier Luxury Salon"
                            />
                        </div>
                    </div>

                    <div className="content-section-editor">
                        <h3 className="admin-section-title">
                            <HiOutlinePencilSquare aria-hidden />
                            Title & subtitle
                        </h3>
                        <div className="form-group">
                            <label>Main Title</label>
                            <input
                                type="text"
                                value={heroData.title_main}
                                onChange={(e) => setHeroData({ ...heroData, title_main: e.target.value })}
                                placeholder="Where Elegance Meets Expert Care"
                            />
                        </div>
                        <div className="form-group">
                            <label>Highlighted Word (appears in gold)</label>
                            <input
                                type="text"
                                value={heroData.title_highlight}
                                onChange={(e) => setHeroData({ ...heroData, title_highlight: e.target.value })}
                                placeholder="Elegance"
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea
                                value={heroData.subtitle}
                                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                                rows="3"
                                placeholder="Experience world-class beauty and grooming services..."
                            />
                        </div>
                    </div>

                    <div className="content-section-editor">
                        <h3 className="admin-section-title">
                            <HiOutlineChartBarSquare aria-hidden />
                            Trust indicators
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <input
                                    type="number"
                                    value={heroData.stat_years}
                                    onChange={(e) => setHeroData({ ...heroData, stat_years: parseInt(e.target.value) })}
                                    placeholder="10"
                                />
                            </div>
                            <div className="form-group">
                                <label>Happy Clients</label>
                                <input
                                    type="number"
                                    value={heroData.stat_clients}
                                    onChange={(e) => setHeroData({ ...heroData, stat_clients: parseInt(e.target.value) })}
                                    placeholder="5000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Premium Services</label>
                                <input
                                    type="number"
                                    value={heroData.stat_services}
                                    onChange={(e) => setHeroData({ ...heroData, stat_services: parseInt(e.target.value) })}
                                    placeholder="50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="admin-btn" disabled={saving} style={{ width: '200px' }}>
                            {saving ? 'Saving...' : 'Save Hero Section'}
                        </button>
                    </div>
                </form>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <form onSubmit={handleServicesSubmit}>
                    {servicesData.map((service, index) => (
                        <div key={index} className="content-section-editor" style={{ position: 'relative' }}>
                            <h3>Service Card {index + 1}</h3>

                            <button
                                type="button"
                                className="admin-btn-with-icon"
                                onClick={() => removeService(index)}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                }}
                            >
                                <HiOutlineTrash aria-hidden />
                                Remove
                            </button>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                                    placeholder="Hair Styling"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={service.description}
                                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                    placeholder="Precision cuts, styling & treatments"
                                />
                            </div>

                            <div className="form-group">
                                <label>Icon (emoji or symbol shown on site)</label>
                                <input
                                    type="text"
                                    value={service.icon}
                                    onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                                    placeholder="e.g. ✂ or short text"
                                    style={{ fontSize: '1.1rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Image</label>
                                {service.image_url && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <img
                                            src={service.image_url.startsWith('http') ? service.image_url : `${API_ORIGIN}${service.image_url}`}
                                            alt={service.title}
                                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            handleServiceImageUpload(index, e.target.files[0]);
                                        }
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    Or paste image URL:
                                </small>
                                <input
                                    type="text"
                                    value={service.image_url}
                                    onChange={(e) => handleServiceChange(index, 'image_url', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{ marginTop: '5px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={service.is_active}
                                        onChange={(e) => handleServiceChange(index, 'is_active', e.target.checked)}
                                    />
                                    Active (Show on home page)
                                </label>
                            </div>
                        </div>
                    ))}

                    <button type="button" className="admin-btn admin-btn-with-icon" onClick={addService} style={{ marginBottom: '20px' }}>
                        <HiOutlinePlus aria-hidden />
                        Add service card
                    </button>

                    <div className="form-actions">
                        <button type="submit" className="admin-btn" disabled={saving} style={{ width: '200px' }}>
                            {saving ? 'Saving...' : 'Save Services'}
                        </button>
                    </div>
                </form>
            )}

            {/* Prices Tab */}
            {activeTab === 'prices' && (
                <form onSubmit={handlePricesSubmit}>
                    {pricesData.map((price, index) => (
                        <div key={index} className="content-section-editor" style={{ position: 'relative' }}>
                            <h3>Price Item {index + 1}</h3>

                            <button
                                type="button"
                                className="admin-btn-with-icon"
                                onClick={() => removePrice(index)}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                }}
                            >
                                <HiOutlineTrash aria-hidden />
                                Remove
                            </button>

                            <div className="form-group">
                                <label>Service Name</label>
                                <input
                                    type="text"
                                    value={price.service_name}
                                    onChange={(e) => handlePriceChange(index, 'service_name', e.target.value)}
                                    placeholder="Hair Styling"
                                />
                            </div>

                            <div className="form-group">
                                <label>Price</label>
                                <input
                                    type="text"
                                    value={price.price}
                                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                                    placeholder="₹999+"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={price.is_active}
                                        onChange={(e) => handlePriceChange(index, 'is_active', e.target.checked)}
                                    />
                                    Active (Show on home page)
                                </label>
                            </div>
                        </div>
                    ))}

                    <button type="button" className="admin-btn admin-btn-with-icon" onClick={addPrice} style={{ marginBottom: '20px' }}>
                        <HiOutlinePlus aria-hidden />
                        Add price item
                    </button>

                    <div className="form-actions">
                        <button type="submit" className="admin-btn" disabled={saving} style={{ width: '200px' }}>
                            {saving ? 'Saving...' : 'Save Prices'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
