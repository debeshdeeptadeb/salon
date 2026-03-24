import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlinePresentationChartLine,
    HiOutlineBuildingOffice2,
    HiOutlineUsers,
    HiOutlineSparkles,
    HiOutlineClipboardDocumentList,
    HiOutlinePhoto,
    HiOutlineGift,
    HiOutlineQrCode,
    HiOutlineCalendarDays,
    HiOutlineDocumentText,
    HiOutlinePaintBrush,
    HiOutlineHome,
    HiOutlineChatBubbleLeftRight,
    HiOutlineArrowRightOnRectangle,
    HiOutlineUserCircle,
} from 'react-icons/hi2';
import './Sidebar.css';

const iconProps = { className: 'nav-icon-svg', 'aria-hidden': true };

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const platformItems =
        user?.role === 'super_admin'
            ? [
                  { path: '/admin/platform/salons', Icon: HiOutlineBuildingOffice2, label: 'Salons (tenants)' },
                  { path: '/admin/platform/staff', Icon: HiOutlineUsers, label: 'Salon staff' },
              ]
            : user?.role === 'salon_admin'
              ? [{ path: '/admin/platform/staff', Icon: HiOutlineUsers, label: 'Salon staff' }]
              : [];

    const menuItems = [
        { path: '/admin/dashboard', Icon: HiOutlinePresentationChartLine, label: 'Dashboard' },
        ...platformItems,
        { path: '/admin/services', Icon: HiOutlineSparkles, label: 'Services' },
        { path: '/admin/catalogue', Icon: HiOutlineClipboardDocumentList, label: 'Catalogue' },
        { path: '/admin/gallery', Icon: HiOutlinePhoto, label: 'Gallery' },
        { path: '/admin/offers', Icon: HiOutlineGift, label: 'Offers' },
        { path: '/admin/qr-codes', Icon: HiOutlineQrCode, label: 'QR Codes' },
        { path: '/admin/bookings', Icon: HiOutlineCalendarDays, label: 'Bookings' },
        { path: '/admin/content', Icon: HiOutlineDocumentText, label: 'Content' },
        { path: '/admin/settings', Icon: HiOutlinePaintBrush, label: 'Site Settings' },
        { path: '/admin/home-content', Icon: HiOutlineHome, label: 'Home Content' },
        { path: '/admin/enquiries', Icon: HiOutlineChatBubbleLeftRight, label: 'Enquiries' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>MINJAL SALON</h2>
                <p>Admin Panel</p>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar" aria-hidden="true">
                    <HiOutlineUserCircle size={28} />
                </div>
                <div className="user-info">
                    <p className="user-name">{user?.name || 'Admin'}</p>
                    <p className="user-email">{user?.email}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.Icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <Icon {...iconProps} size={22} />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button type="button" className="logout-btn" onClick={handleLogout}>
                <HiOutlineArrowRightOnRectangle size={20} aria-hidden />
                <span>Logout</span>
            </button>
        </aside>
    );
}
