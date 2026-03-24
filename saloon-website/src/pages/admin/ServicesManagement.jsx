import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineStar, HiOutlineMinusSmall } from 'react-icons/hi2';
import { servicesAPI, API_ORIGIN } from '../../services/api';
import { toast } from 'react-toastify';

export default function ServicesManagement() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        duration: '',
        is_featured: false,
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                servicesAPI.getAll(),
                servicesAPI.getCategories()
            ]);
            setServices(servicesRes.data.data);
            setCategories(categoriesRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('category_id', formData.category_id);
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('duration', formData.duration);
        data.append('is_featured', formData.is_featured);
        data.append('is_active', formData.is_active);

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingService) {
                await servicesAPI.update(editingService.id, data);
                toast.success('Service updated successfully');
            } else {
                await servicesAPI.create(data);
                toast.success('Service created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            category_id: service.category_id,
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration: service.duration,
            is_featured: service.is_featured,
            is_active: service.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            await servicesAPI.delete(id);
            toast.success('Service deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete service');
        }
    };

    const resetForm = () => {
        setFormData({
            category_id: '',
            name: '',
            description: '',
            price: '',
            duration: '',
            is_featured: false,
            is_active: true
        });
        setImageFile(null);
        setEditingService(null);
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
        <div className="admin-page admin-ui-page services-management">
            <div className="admin-ui-header admin-ui-header--split">
                <div>
                    <h1>Services</h1>
                    <p className="admin-ui-subtitle" style={{ marginTop: 8 }}>
                        Manage categories, pricing, and visibility for this tenant.
                    </p>
                </div>
                <button type="button" className="admin-btn admin-btn-with-icon" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus size={20} aria-hidden />
                    Add service
                </button>
            </div>

            <div className="admin-table-scroll">
            <table className="admin-table admin-table-pro">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Featured</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.id}>
                            <td>
                                {service.image_url && (
                                    <img
                                        src={`${API_ORIGIN}${service.image_url}`}
                                        alt={service.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                )}
                            </td>
                            <td>{service.name}</td>
                            <td>{service.category_name}</td>
                            <td>₹{service.price}</td>
                            <td>{service.duration} mins</td>
                            <td>
                                {service.is_featured ? (
                                    <span className="admin-featured-pill" title="Featured">
                                        <HiOutlineStar size={14} aria-hidden /> Featured
                                    </span>
                                ) : (
                                    <span className="admin-muted-dash" aria-hidden>
                                        <HiOutlineMinusSmall size={18} />
                                    </span>
                                )}
                            </td>
                            <td>
                                <span className={`status-badge ${service.is_active ? 'resolved' : 'pending'}`}>
                                    {service.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button className="btn-edit" onClick={() => handleEdit(service)}>
                                        Edit
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(service.id)}>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Service Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
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
                                <label>Service Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </div>

                            <div className="form-checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    />
                                    Featured Service
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingService ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
