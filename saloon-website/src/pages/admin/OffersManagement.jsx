import { useState, useEffect } from 'react';
import {
    HiOutlineGift,
    HiOutlinePlus,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
} from 'react-icons/hi2';
import { offersAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function OffersManagement() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_active: false,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await offersAPI.getAll();
            setOffers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingOffer) {
                await offersAPI.update(editingOffer.id, formData);
                toast.success('Offer updated successfully');
            } else {
                await offersAPI.create(formData);
                toast.success('Offer created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchOffers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description || '',
            is_active: offer.is_active,
            start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
            end_date: offer.end_date ? offer.end_date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;

        try {
            await offersAPI.delete(id);
            toast.success('Offer deleted successfully');
            fetchOffers();
        } catch (error) {
            toast.error('Failed to delete offer');
        }
    };

    const handleToggleActive = async (offer) => {
        try {
            await offersAPI.update(offer.id, {
                ...offer,
                is_active: !offer.is_active
            });
            toast.success('Offer status updated');
            fetchOffers();
        } catch (error) {
            toast.error('Failed to update offer');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            is_active: false,
            start_date: '',
            end_date: ''
        });
        setEditingOffer(null);
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

    const activeOffer = offers.find(o => o.is_active);

    return (
        <div className="admin-page admin-ui-page offers-management">
            <div className="admin-ui-header admin-ui-header--split">
                <div>
                    <h1 className="admin-page-title-row">
                        <HiOutlineGift aria-hidden />
                        Offers
                    </h1>
                    <p className="admin-ui-subtitle">Promotions shown on the public site when active.</p>
                </div>
                <button type="button" className="admin-btn admin-btn-with-icon" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus aria-hidden />
                    Add offer
                </button>
            </div>

            {activeOffer && (
                <div className="active-offer-banner">
                    <div className="banner-icon" aria-hidden>
                        <HiOutlineGift />
                    </div>
                    <div className="banner-content">
                        <h3>Currently Active Offer</h3>
                        <p><strong>{activeOffer.title}</strong></p>
                        <p>{activeOffer.description}</p>
                    </div>
                </div>
            )}

            <div className="admin-table-scroll">
            <table className="admin-table admin-table-pro">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {offers.map((offer) => (
                        <tr key={offer.id}>
                            <td><strong>{offer.title}</strong></td>
                            <td style={{ maxWidth: '300px' }}>{offer.description}</td>
                            <td>{offer.start_date ? new Date(offer.start_date).toLocaleDateString() : '-'}</td>
                            <td>{offer.end_date ? new Date(offer.end_date).toLocaleDateString() : '-'}</td>
                            <td>
                                <button
                                    type="button"
                                    className={`toggle-btn ${offer.is_active ? 'active' : 'inactive'}`}
                                    onClick={() => handleToggleActive(offer)}
                                >
                                    {offer.is_active ? (
                                        <>
                                            <HiOutlineCheckCircle size={16} aria-hidden />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineXCircle size={16} aria-hidden />
                                            Inactive
                                        </>
                                    )}
                                </button>
                            </td>
                            <td>
                                <div className="action-btns">
                                    <button className="btn-edit" onClick={() => handleEdit(offer)}>
                                        Edit
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(offer.id)}>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            {offers.length === 0 && (
                <div className="empty-state">
                    <p>No offers created yet. Create your first offer!</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Offer Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g., Grand Opening Offer - 20% OFF"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    placeholder="Additional details about the offer..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    Set as Active Offer (Only one offer can be active at a time)
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingOffer ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
