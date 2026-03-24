import { useState, useEffect } from 'react';
import {
    HiOutlineDocumentText,
    HiOutlineSparkles,
    HiOutlineBookOpen,
    HiOutlineUserCircle,
} from 'react-icons/hi2';
import { contentAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function ContentManagement() {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        about: { title: '', content: '' },
        brand_story: { title: '', content: '' },
        philosophy: { title: '', content: '' },
        owner: { title: '', content: '' }
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await contentAPI.getAbout();
            const data = response.data.data;
            setContent(data);

            // Initialize form data
            setFormData({
                about: data.about || { title: 'About Us', content: '' },
                brand_story: data.brand_story || { title: 'Our Story', content: '' },
                philosophy: data.philosophy || { title: 'Our Philosophy', content: '' },
                owner: data.owner || { title: 'Meet Our Founder', content: '' }
            });
        } catch (error) {
            toast.error('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await contentAPI.updateAbout(formData);
            toast.success('Content updated successfully');
            fetchContent();
        } catch (error) {
            toast.error('Failed to update content');
        } finally {
            setSaving(false);
        }
    };

    const handleSectionChange = (section, field, value) => {
        setFormData({
            ...formData,
            [section]: {
                ...formData[section],
                [field]: value
            }
        });
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
                <h1 className="admin-page-title-row">
                    <HiOutlineDocumentText aria-hidden />
                    Content Management
                </h1>
                <p className="admin-ui-subtitle">Edit About page copy and structure.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* About Section */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineDocumentText aria-hidden />
                        About Section
                    </h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.about.title}
                            onChange={(e) => handleSectionChange('about', 'title', e.target.value)}
                            placeholder="About Us"
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={formData.about.content}
                            onChange={(e) => handleSectionChange('about', 'content', e.target.value)}
                            rows="4"
                            placeholder="Write about your salon..."
                        />
                    </div>
                </div>

                {/* Brand Story Section */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineSparkles aria-hidden />
                        Brand Story
                    </h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.brand_story.title}
                            onChange={(e) => handleSectionChange('brand_story', 'title', e.target.value)}
                            placeholder="Our Story"
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={formData.brand_story.content}
                            onChange={(e) => handleSectionChange('brand_story', 'content', e.target.value)}
                            rows="5"
                            placeholder="Tell your brand's story..."
                        />
                    </div>
                </div>

                {/* Philosophy Section */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineBookOpen aria-hidden />
                        Philosophy
                    </h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.philosophy.title}
                            onChange={(e) => handleSectionChange('philosophy', 'title', e.target.value)}
                            placeholder="Our Philosophy"
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={formData.philosophy.content}
                            onChange={(e) => handleSectionChange('philosophy', 'content', e.target.value)}
                            rows="4"
                            placeholder="Describe your philosophy and values..."
                        />
                    </div>
                </div>

                {/* Owner Section */}
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineUserCircle aria-hidden />
                        Owner / Founder
                    </h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.owner.title}
                            onChange={(e) => handleSectionChange('owner', 'title', e.target.value)}
                            placeholder="Meet Our Founder"
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={formData.owner.content}
                            onChange={(e) => handleSectionChange('owner', 'content', e.target.value)}
                            rows="4"
                            placeholder="Introduce the owner/founder..."
                        />
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
