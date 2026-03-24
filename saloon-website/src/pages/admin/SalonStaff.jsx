import { useEffect, useState } from 'react';
import {
    HiOutlineUsers,
    HiOutlineUserPlus,
    HiOutlineListBullet,
    HiOutlineTrash,
} from 'react-icons/hi2';
import { salonStaffAPI, salonsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function SalonStaff() {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [salonId, setSalonId] = useState('');
    const [saving, setSaving] = useState(false);

    const isSuper = user?.role === 'super_admin';
    const isSalonAdmin = user?.role === 'salon_admin';

    useEffect(() => {
        if (!isSuper && !isSalonAdmin) return;
        if (isSuper) {
            salonsAPI
                .list()
                .then((r) => {
                    const list = r.data.data || [];
                    setSalons(list);
                    const sid = localStorage.getItem('superAdminSalonId');
                    if (sid) setSalonId(sid);
                    else if (list.length) setSalonId(String(list[0].id));
                })
                .catch(() => {});
        }
        loadStaff();
    }, [user]);

    const loadStaff = async () => {
        try {
            const sid =
                user?.role === 'super_admin'
                    ? localStorage.getItem('superAdminSalonId')
                    : user?.salon_id;
            if (user?.role === 'super_admin' && !sid) {
                setStaff([]);
                return;
            }
            const res = await salonStaffAPI.list(sid);
            setStaff(res.data.data || []);
        } catch {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password || !name.trim()) {
            toast.error('Fill email, password, and name');
            return;
        }
        setSaving(true);
        try {
            const payload = { email: email.trim(), password, name: name.trim() };
            if (isSuper) {
                const sid = salonId || localStorage.getItem('superAdminSalonId');
                if (!sid) {
                    toast.error('Select a tenant in the switcher or pick a salon');
                    setSaving(false);
                    return;
                }
                payload.salon_id = parseInt(sid, 10);
            }
            await salonStaffAPI.create(payload);
            toast.success('Staff account created');
            setEmail('');
            setPassword('');
            setName('');
            loadStaff();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not create account');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this admin account?')) return;
        try {
            await salonStaffAPI.delete(id);
            toast.success('Removed');
            loadStaff();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed');
        }
    };

    if (!isSuper && !isSalonAdmin) {
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
                    <HiOutlineUsers aria-hidden />
                    Salon staff (admins)
                </h1>
                <p className="admin-ui-subtitle">
                    {isSuper
                        ? 'Create logins for each salon. Use the tenant switcher to choose which salon you are adding staff to.'
                        : 'Add more managers for your salon. They share the same dashboard and data.'}
                </p>
            </div>

            {isSuper && salons.length > 0 && (
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineUserPlus aria-hidden />
                        Salon for new account
                    </h3>
                    <div className="form-group">
                        <label>Tenant</label>
                        <select value={salonId} onChange={(e) => setSalonId(e.target.value)}>
                            {salons.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.slug})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="content-section-editor">
                <h3 className="admin-section-title">
                    <HiOutlineUserPlus aria-hidden />
                    Add admin
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Temporary password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className="admin-btn" disabled={saving}>
                        {saving ? 'Saving…' : 'Create admin'}
                    </button>
                </form>
            </div>

            <div className="content-section-editor" style={{ marginTop: 24 }}>
                <h3 className="admin-section-title">
                    <HiOutlineListBullet aria-hidden />
                    Accounts
                </h3>
                {staff.length === 0 ? (
                    <p className="admin-ui-subtitle" style={{ margin: 0 }}>
                        No staff yet.
                    </p>
                ) : (
                    <table className="bookings-table admin-table-pro" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.name}</td>
                                    <td>{m.email}</td>
                                    <td>
                                        {m.id !== user?.id && (
                                            <button
                                                type="button"
                                                className="btn-delete admin-btn-with-icon"
                                                onClick={() => handleDelete(m.id)}
                                            >
                                                <HiOutlineTrash aria-hidden />
                                                Remove
                                            </button>
                                        )}
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
