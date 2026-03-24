import { useState, useEffect } from 'react';
import { HiOutlinePhoto, HiOutlineEye, HiOutlineEyeSlash, HiOutlineTrash, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { galleryAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';

export default function GalleryManagement() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await galleryAPI.getAll();
            setImages(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch gallery images');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        setUploading(true);

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('caption', '');
                formData.append('display_order', 0);

                await galleryAPI.upload(formData);
            }

            toast.success(`${files.length} image(s) uploaded successfully`);
            fetchImages();
        } catch (error) {
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await galleryAPI.delete(id);
            toast.success('Image deleted successfully');
            fetchImages();
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    const handleToggleActive = async (image) => {
        try {
            await galleryAPI.update(image.id, {
                caption: image.caption,
                display_order: image.display_order,
                is_active: !image.is_active
            });
            toast.success('Image status updated');
            fetchImages();
        } catch (error) {
            toast.error('Failed to update image');
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
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title-row">
                        <HiOutlinePhoto size={26} aria-hidden />
                        Gallery
                    </h1>
                    <p className="admin-ui-subtitle" style={{ marginTop: 8 }}>
                        Upload and organize photos shown on the public gallery page.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        id="gallery-upload"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                    <label htmlFor="gallery-upload" className="admin-btn admin-btn-with-icon" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                        <HiOutlineArrowUpTray size={20} aria-hidden />
                        {uploading ? 'Uploading…' : 'Upload images'}
                    </label>
                </div>
            </div>

            <div className="gallery-stats">
                <div className="stat-item">
                    <strong>{images.length}</strong>
                    <span>Total</span>
                </div>
                <div className="stat-item">
                    <strong>{images.filter(img => img.is_active).length}</strong>
                    <span>Active</span>
                </div>
                <div className="stat-item">
                    <strong>{images.filter(img => !img.is_active).length}</strong>
                    <span>Hidden</span>
                </div>
            </div>

            <div className="gallery-grid-admin">
                {images.map((image) => (
                    <div key={image.id} className="gallery-item-admin">
                        <img
                            src={`${API_ORIGIN}${image.image_url}`}
                            alt={image.caption || 'Gallery image'}
                        />
                        <div className="gallery-item-overlay">
                            <div className="gallery-item-actions">
                                <button
                                    type="button"
                                    className={`btn-toggle ${image.is_active ? 'active' : 'inactive'}`}
                                    onClick={() => handleToggleActive(image)}
                                    title={image.is_active ? 'Hide' : 'Show'}
                                >
                                    {image.is_active ? <HiOutlineEye size={18} /> : <HiOutlineEyeSlash size={18} />}
                                </button>
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={() => handleDelete(image.id)}
                                    title="Delete"
                                >
                                    <HiOutlineTrash size={18} aria-hidden />
                                </button>
                            </div>
                            {image.caption && (
                                <div className="gallery-item-caption">
                                    {image.caption}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="empty-state">
                    <p>No images in gallery. Upload some images to get started!</p>
                </div>
            )}
        </div>
    );
}
