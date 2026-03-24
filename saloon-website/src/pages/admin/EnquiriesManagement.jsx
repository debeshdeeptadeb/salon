import { useState, useEffect } from 'react';
import {
    HiOutlineEnvelope,
    HiOutlineInbox,
    HiOutlineCheck,
    HiOutlineTrash,
} from 'react-icons/hi2';
import { enquiriesAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function EnquiriesManagement() {
    const [enquiries, setEnquiries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnquiries();
    }, [filter]);

    const fetchEnquiries = async () => {
        try {
            const resolved = filter === 'resolved' ? 'true' : filter === 'pending' ? 'false' : undefined;
            const response = await enquiriesAPI.getAll(resolved);
            setEnquiries(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch enquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await enquiriesAPI.resolve(id);
            toast.success('Enquiry marked as resolved');
            fetchEnquiries();
        } catch (error) {
            toast.error('Failed to resolve enquiry');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

        try {
            await enquiriesAPI.delete(id);
            toast.success('Enquiry deleted');
            fetchEnquiries();
        } catch (error) {
            toast.error('Failed to delete enquiry');
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
                    <HiOutlineEnvelope aria-hidden />
                    Enquiries
                </h1>
                <p className="admin-ui-subtitle">Contact form submissions from your public site.</p>
            </div>

            <div className="admin-filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({enquiries.length})
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={filter === 'resolved' ? 'active' : ''}
                    onClick={() => setFilter('resolved')}
                >
                    Resolved
                </button>
            </div>

            {enquiries.length === 0 ? (
                <div className="empty-state">
                    <div className="admin-empty-illustration" aria-hidden>
                        <HiOutlineInbox />
                    </div>
                    <p>No enquiries match this filter.</p>
                </div>
            ) : (
                <table className="admin-table admin-table-pro">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enquiries.map((enquiry) => (
                            <tr key={enquiry.id}>
                                <td>{enquiry.name}</td>
                                <td>
                                    <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
                                </td>
                                <td>{enquiry.email || '-'}</td>
                                <td style={{ maxWidth: '300px' }}>{enquiry.message}</td>
                                <td>{new Date(enquiry.created_at).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge ${enquiry.is_resolved ? 'resolved' : 'pending'}`}>
                                        {enquiry.is_resolved ? 'Resolved' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        {!enquiry.is_resolved && (
                                            <button
                                                type="button"
                                                className="btn-edit admin-btn-with-icon"
                                                onClick={() => handleResolve(enquiry.id)}
                                            >
                                                <HiOutlineCheck aria-hidden />
                                                Resolve
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn-delete admin-btn-with-icon"
                                            onClick={() => handleDelete(enquiry.id)}
                                        >
                                            <HiOutlineTrash aria-hidden />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
