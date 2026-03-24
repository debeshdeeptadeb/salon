import { useState, useEffect } from 'react';
import {
    HiOutlinePaintBrush,
    HiOutlineDocumentText,
    HiOutlineBars3CenterLeft,
    HiOutlineBars3BottomLeft,
    HiOutlineQrCode,
} from 'react-icons/hi2';
import { settingsAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';

export default function SiteSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        site_name: '',
        site_tagline: '',
        navbar_logo_url: '',
        footer_logo_url: ''
    });
    const [navbarLogoFile, setNavbarLogoFile] = useState(null);
    const [footerLogoFile, setFooterLogoFile] = useState(null);
    const [upiQrFile, setUpiQrFile] = useState(null);
    const [navbarPreview, setNavbarPreview] = useState('');
    const [footerPreview, setFooterPreview] = useState('');
    const [upiQrPreview, setUpiQrPreview] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsAPI.getSettings();
            const data = response.data.data;
            setSettings(data);
            setNavbarPreview(data.navbar_logo_url ? `${API_ORIGIN}${data.navbar_logo_url}` : '');
            setFooterPreview(data.footer_logo_url ? `${API_ORIGIN}${data.footer_logo_url}` : '');
            setUpiQrPreview(data.upi_qr_image_url ? `${API_ORIGIN}${data.upi_qr_image_url}` : '');
        } catch (error) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleNavbarLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNavbarLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNavbarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFooterLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFooterLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFooterPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpiQrChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUpiQrFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setUpiQrPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload navbar logo if changed
            if (navbarLogoFile) {
                const formData = new FormData();
                formData.append('logo', navbarLogoFile);
                formData.append('logoType', 'navbar');
                const response = await settingsAPI.uploadLogo(formData);
                settings.navbar_logo_url = response.data.data.logoUrl;
            }

            // Upload footer logo if changed
            if (footerLogoFile) {
                const formData = new FormData();
                formData.append('logo', footerLogoFile);
                formData.append('logoType', 'footer');
                const response = await settingsAPI.uploadLogo(formData);
                settings.footer_logo_url = response.data.data.logoUrl;
            }

            // Upload UPI QR if changed
            if (upiQrFile) {
                const formData = new FormData();
                formData.append('upiQr', upiQrFile);
                const response = await settingsAPI.uploadUpiQR(formData);
                settings.upi_qr_image_url = response.data.data.upiQrUrl;
            }

            // Update settings
            await settingsAPI.updateSettings(settings);
            toast.success('Settings updated successfully');
            setNavbarLogoFile(null);
            setFooterLogoFile(null);
            setUpiQrFile(null);
            fetchSettings();
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page admin-ui-page">
            <div className="admin-ui-header">
                <h1>
                    <HiOutlinePaintBrush size={28} aria-hidden /> Site settings
                </h1>
                <p className="admin-ui-subtitle">
                    Branding, logos, and UPI payment QR for the public site and booking flow.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineDocumentText size={20} aria-hidden /> Site information
                    </h3>
                    <div className="form-group">
                        <label>Site Name</label>
                        <input
                            type="text"
                            value={settings.site_name}
                            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                            placeholder="MINJAL"
                        />
                    </div>
                    <div className="form-group">
                        <label>Site Tagline</label>
                        <input
                            type="text"
                            value={settings.site_tagline}
                            onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                            placeholder="Luxury Salon"
                        />
                    </div>
                </div>

                {/* Navbar Logo */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineBars3CenterLeft size={20} aria-hidden /> Navbar logo
                    </h3>
                    <div className="form-group">
                        <label>Current Logo</label>
                        {navbarPreview && (
                            <div style={{ marginBottom: '15px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block' }}>
                                <img src={navbarPreview} alt="Navbar Logo" style={{ maxHeight: '60px', maxWidth: '200px' }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Upload New Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleNavbarLogoChange}
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Recommended: SVG or PNG with transparent background
                        </small>
                    </div>
                </div>

                {/* Footer Logo */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineBars3BottomLeft size={20} aria-hidden /> Footer logo
                    </h3>
                    <div className="form-group">
                        <label>Current Logo</label>
                        {footerPreview && (
                            <div style={{ marginBottom: '15px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block' }}>
                                <img src={footerPreview} alt="Footer Logo" style={{ maxHeight: '60px', maxWidth: '200px' }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Upload New Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFooterLogoChange}
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Recommended: SVG or PNG with transparent background
                        </small>
                    </div>
                </div>

                {/* UPI Payment QR */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineQrCode size={20} aria-hidden /> UPI payment QR
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '16px' }}>
                        Upload your UPI QR code. Customers will see this when booking via QR scan to make payment.
                    </p>
                    <div className="form-group">
                        <label>UPI ID (e.g. mysalon@upi)</label>
                        <input
                            type="text"
                            value={settings.upi_id || ''}
                            onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                            placeholder="yourname@upi or yourname@okaxis"
                        />
                        <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                            This UPI ID will be displayed below the QR so customers can manually enter it if needed
                        </small>
                    </div>
                    <div className="form-group">
                        <label>Current UPI QR Code</label>
                        {upiQrPreview ? (
                            <div style={{ marginBottom: '15px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block' }}>
                                <img src={upiQrPreview} alt="UPI QR" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
                            </div>
                        ) : (
                            <div style={{ marginBottom: '15px', padding: '20px', background: '#fafafa', borderRadius: '8px', border: '2px dashed #ddd', textAlign: 'center', color: '#aaa', fontSize: '0.88rem' }}>
                                No UPI QR uploaded yet
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Upload New QR Code</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpiQrChange}
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Upload a clear screenshot of your GPay / PhonePe / Paytm QR code (PNG or JPG)
                        </small>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="admin-btn"
                        disabled={saving}
                        style={{ width: '200px', marginTop: '20px' }}
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
