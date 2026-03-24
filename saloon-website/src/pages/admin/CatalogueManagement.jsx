import { useState, useEffect } from 'react';
import { HiOutlineRectangleStack, HiOutlinePlus, HiOutlinePhoto } from 'react-icons/hi2';
import { catalogueAPI, servicesAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';

export default function CatalogueManagement() {
    const [catalogueItems, setCatalogueItems] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        service_id: '',
        title: '',
        description: '',
        price: '',
        duration: '',
        is_visible: true,
        display_order: 0
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catalogueRes, servicesRes] = await Promise.all([
                catalogueAPI.getAll(),
                servicesAPI.getAll()
            ]);
            setCatalogueItems(catalogueRes.data.data);
            setServices(servicesRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        if (formData.service_id) data.append('service_id', formData.service_id);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('duration', formData.duration);
        data.append('is_visible', formData.is_visible);
        data.append('display_order', formData.display_order);

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingItem) {
                await catalogueAPI.update(editingItem.id, data);
                toast.success('Catalogue item updated successfully');
            } else {
                await catalogueAPI.create(data);
                toast.success('Catalogue item created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            service_id: item.service_id || '',
            title: item.title,
            description: item.description || '',
            price: item.price,
            duration: item.duration,
            is_visible: item.is_visible,
            display_order: item.display_order || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this catalogue item?')) return;

        try {
            await catalogueAPI.delete(id);
            toast.success('Catalogue item deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete catalogue item');
        }
    };

    const resetForm = () => {
        setFormData({
            service_id: '',
            title: '',
            description: '',
            price: '',
            duration: '',
            is_visible: true,
            display_order: 0
        });
        setImageFile(null);
        setEditingItem(null);
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
            <div className="admin-ui-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                    <h1 className="admin-page-title-row">
                        <HiOutlineRectangleStack aria-hidden />
                        Catalogue
                    </h1>
                    <p className="admin-ui-subtitle">Service cards and pricing shown on the public catalogue.</p>
                </div>
                <button type="button" className="admin-btn admin-btn-with-icon" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus aria-hidden />
                    Add item
                </button>
            </div>

            <div className="catalogue-grid-admin">
                {catalogueItems.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <div className="admin-empty-illustration" aria-hidden style={{ margin: '0 auto 1rem' }}>
                            <HiOutlinePhoto />
                        </div>
                        <p style={{ margin: 0, color: '#64748b' }}>No catalogue items yet. Add your first service card with image and pricing.</p>
                    </div>
                )}
                {catalogueItems.map((item) => (
                    <div key={item.id} className="catalogue-card-admin">
                        {item.image_url && (
                            <img
                                src={`${API_ORIGIN}${item.image_url}`}
                                alt={item.title}
                                className="catalogue-img-admin"
                            />
                        )}
                        <div className="catalogue-info-admin">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <div className="catalogue-meta">
                                <span>₹{item.price}</span>
                                <span>{item.duration} mins</span>
                                <span className={`status-badge ${item.is_visible ? 'resolved' : 'pending'}`}>
                                    {item.is_visible ? 'Visible' : 'Hidden'}
                                </span>
                            </div>
                            <div className="action-btns">
                                <button className="btn-edit" onClick={() => handleEdit(item)}>
                                    Edit
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingItem ? 'Edit Catalogue Item' : 'Add New Catalogue Item'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Link to Service (Optional)</label>
                                <select
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>{service.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Duration (mins) *</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    required={!editingItem}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_visible}
                                            onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                                        />
                                        Visible on Website
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
