import { useEffect, useState } from 'react';
import {
    HiOutlineUsers,
    HiOutlineUserPlus,
    HiOutlineListBullet,
    HiOutlineTrash,
    HiOutlineMapPin,
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
    const [mapsLink, setMapsLink] = useState('');
    const [mapsSaving, setMapsSaving] = useState(false);

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
                    if (sid && list.some((s) => String(s.id) === String(sid))) {
                        setSalonId(sid);
                    } else if (list.length) {
                        const first = String(list[0].id);
                        setSalonId(first);
                        localStorage.setItem('superAdminSalonId', first);
                    }
                })
                .catch(() => {})
                .finally(() => {
                    loadStaff();
                });
        } else {
            loadStaff();
        }
    }, [user]);

    useEffect(() => {
        if (!isSuper || !salonId || !salons.length) return;
        const s = salons.find((x) => String(x.id) === String(salonId));
        setMapsLink(s?.google_maps_url || '');
    }, [isSuper, salonId, salons]);

    useEffect(() => {
        if (!isSalonAdmin || !user?.salon_id) return;
        salonsAPI
            .getOne(user.salon_id)
            .then((r) => setMapsLink(r.data.data?.google_maps_url || ''))
            .catch(() => {});
    }, [isSalonAdmin, user?.salon_id]);

    const loadStaff = async () => {
        try {
            if (user?.role === 'salon_admin') {
                const res = await salonStaffAPI.list(user?.salon_id);
                setStaff(res.data.data || []);
                return;
            }
            if (user?.role === 'super_admin') {
                const res = await salonStaffAPI.listAll();
                setStaff(res.data.data || []);
            }
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
            if (isSuper && payload.salon_id) {
                localStorage.setItem('superAdminSalonId', String(payload.salon_id));
            }
            loadStaff();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not create account');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMaps = async (e) => {
        e?.preventDefault();
        const id = isSuper ? parseInt(salonId, 10) : user?.salon_id;
        if (!id) {
            toast.error('Select a salon first');
            return;
        }
        setMapsSaving(true);
        try {
            const res = await salonsAPI.patch(id, {
                google_maps_url: mapsLink.trim() || null,
            });
            const updated = res.data.data;
            toast.success('Google Maps link saved');
            if (isSuper) {
                setSalons((prev) =>
                    prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not save Maps link');
        } finally {
            setMapsSaving(false);
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
                        ? 'Create logins per tenant using the dropdown below. All salon managers are listed together with their salon name.'
                        : 'Add more managers for your salon. They share the same dashboard and data.'}
                </p>
            </div>

            {isSuper && salons.length > 0 && (
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineUserPlus aria-hidden />
                        Salon for new account
                    </h3>
                    <p className="admin-ui-subtitle" style={{ marginTop: 0, marginBottom: 12 }}>
                        New admins are assigned to this tenant. The accounts list below shows every
                        salon manager across all tenants.
                    </p>
                    <div className="form-group">
                        <label>Tenant</label>
                        <select
                            value={salonId}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSalonId(v);
                                localStorage.setItem('superAdminSalonId', v);
                            }}
                        >
                            {salons.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.slug})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {(isSuper && salons.length > 0) || isSalonAdmin ? (
                <div className="content-section-editor">
                    <h3 className="admin-section-title">
                        <HiOutlineMapPin aria-hidden />
                        {isSuper ? 'Exact location (Google Maps)' : 'Salon location on Google Maps'}
                    </h3>
                    <p className="admin-ui-subtitle" style={{ marginTop: 0, marginBottom: 12 }}>
                        Paste the share link from Google Maps (Share → Copy link). Customers can use it for
                        directions and exact pin.
                        {isSuper && (
                            <>
                                {' '}
                                Applies to the tenant selected above.
                            </>
                        )}
                    </p>
                    <form onSubmit={handleSaveMaps}>
                        <div className="form-group">
                            <label htmlFor="salon-google-maps-url">Google Maps link</label>
                            <input
                                id="salon-google-maps-url"
                                type="url"
                                inputMode="url"
                                placeholder="https://maps.app.goo.gl/..."
                                value={mapsLink}
                                onChange={(e) => setMapsLink(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                            <button type="submit" className="admin-btn" disabled={mapsSaving}>
                                {mapsSaving ? 'Saving…' : 'Save Maps link'}
                            </button>
                            {mapsLink.trim().startsWith('http') && (
                                <a
                                    href={mapsLink.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-ui-subtitle"
                                    style={{ margin: 0 }}
                                >
                                    Open link preview →
                                </a>
                            )}
                        </div>
                    </form>
                </div>
            ) : null}

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
                                {isSuper && <th>Salon</th>}
                                <th>Name</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((m) => (
                                <tr key={m.id}>
                                    {isSuper && (
                                        <td>
                                            <strong>{m.salon_name || '—'}</strong>
                                            {m.salon_slug && (
                                                <span
                                                    style={{
                                                        display: 'block',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--admin-text-muted, #6b7280)',
                                                    }}
                                                >
                                                    {m.salon_slug}
                                                </span>
                                            )}
                                        </td>
                                    )}
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
