import { useEffect, useState } from 'react';
import { HiOutlineBuildingOffice2, HiOutlinePlusCircle, HiOutlineQueueList } from 'react-icons/hi2';
import { salonsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PlatformSalons() {
    const { user } = useAuth();
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.role !== 'super_admin') return;
        fetchSalons();
    }, [user]);

    const fetchSalons = async () => {
        try {
            const res = await salonsAPI.list();
            setSalons(res.data.data || []);
        } catch {
            toast.error('Failed to load salons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Salon name is required');
            return;
        }
        setSaving(true);
        try {
            await salonsAPI.create({ name: name.trim(), slug: slug.trim() || undefined });
            toast.success('Salon created');
            setName('');
            setSlug('');
            fetchSalons();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not create salon');
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== 'super_admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

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
                    <HiOutlineBuildingOffice2 aria-hidden />
                    Salons (tenants)
                </h1>
                <p className="admin-ui-subtitle">
                    Create a salon for each customer. Data is isolated per tenant. Use the switcher at the top to work in one
                    salon’s admin.
                </p>
            </div>

            <div className="content-section-editor">
                <h3 className="admin-section-title">
                    <HiOutlinePlusCircle aria-hidden />
                    Add salon
                </h3>
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Display name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Minjal Cuttack"
                        />
                    </div>
                    <div className="form-group">
                        <label>URL slug (optional)</label>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. minjal-cut — used as ?salon= on the public site"
                        />
                    </div>
                    <button type="submit" className="admin-btn" disabled={saving}>
                        {saving ? 'Creating…' : 'Create salon'}
                    </button>
                </form>
            </div>

            <div className="content-section-editor" style={{ marginTop: 24 }}>
                <h3 className="admin-section-title">
                    <HiOutlineQueueList aria-hidden />
                    Existing salons
                </h3>
                {salons.length === 0 ? (
                    <p className="admin-ui-subtitle" style={{ margin: 0 }}>
                        No salons yet.
                    </p>
                ) : (
                    <table className="bookings-table admin-table-pro" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Public link hint</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salons.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>
                                        <code>{s.slug}</code>
                                    </td>
                                    <td style={{ fontSize: '0.88rem', color: '#666' }}>
                                        Append <code>?salon={s.slug}</code> to your site, or set
                                        localStorage <code>publicSalonSlug</code> for testing.
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
