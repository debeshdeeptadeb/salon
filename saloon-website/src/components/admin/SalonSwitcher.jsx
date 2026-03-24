import { useEffect, useState } from 'react';
import { HiOutlineBuildingOffice2, HiOutlineChevronDown } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { salonsAPI } from '../../services/api';
import './SalonSwitcher.css';

export default function SalonSwitcher() {
    const { user } = useAuth();
    const [salons, setSalons] = useState([]);
    const [value, setValue] = useState(() => localStorage.getItem('superAdminSalonId') || '');

    useEffect(() => {
        if (user?.role !== 'super_admin') return;
        salonsAPI
            .list()
            .then((r) => {
                const list = r.data.data || [];
                setSalons(list);
                const stored = localStorage.getItem('superAdminSalonId');
                if (!stored && list.length) {
                    const first = String(list[0].id);
                    localStorage.setItem('superAdminSalonId', first);
                    setValue(first);
                }
            })
            .catch(() => {});
    }, [user]);

    if (user?.role !== 'super_admin') return null;

    const onChange = (e) => {
        const v = e.target.value;
        localStorage.setItem('superAdminSalonId', v);
        setValue(v);
    };

    return (
        <div className="salon-switcher">
            <HiOutlineBuildingOffice2 className="salon-switcher-building" size={22} aria-hidden />
            <span className="salon-switcher-label">Managing tenant</span>
            <div className="salon-switcher-select-wrap">
                <select
                    className="salon-switcher-select"
                    value={value}
                    onChange={onChange}
                    aria-label="Select salon to manage"
                >
                    {salons.length === 0 ? (
                        <option value="">Create a salon under Platform → Salons</option>
                    ) : (
                        salons.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.slug})
                            </option>
                        ))
                    )}
                </select>
                <HiOutlineChevronDown className="salon-switcher-chevron" size={18} aria-hidden />
            </div>
        </div>
    );
}
