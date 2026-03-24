import { Link } from 'react-router-dom';
import {
    HiOutlineSparkles,
    HiOutlineClipboardDocumentList,
    HiOutlinePhoto,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';

const checklist = [
    'Manage services and categories',
    'Update catalogue with images',
    'Upload gallery images',
    'Control offers and promotions',
    'Edit about page content',
    'View and respond to enquiries',
];

export default function DashboardHome() {
    const cards = [
        {
            to: '/admin/services',
            title: 'Services',
            desc: 'Manage your salon services and pricing',
            Icon: HiOutlineSparkles,
        },
        {
            to: '/admin/catalogue',
            title: 'Catalogue',
            desc: 'Service catalogue items for the site',
            Icon: HiOutlineClipboardDocumentList,
        },
        {
            to: '/admin/gallery',
            title: 'Gallery',
            desc: 'Showcase your work with photos',
            Icon: HiOutlinePhoto,
        },
        {
            to: '/admin/enquiries',
            title: 'Enquiries',
            desc: 'Customer messages and follow-ups',
            Icon: HiOutlineChatBubbleLeftRight,
        },
    ];

    return (
        <div className="admin-page admin-ui-page">
            <div className="admin-ui-header">
                <h1>Dashboard</h1>
                <p className="admin-ui-subtitle">
                    Overview of your salon control panel — use the sidebar for all modules.
                </p>
            </div>

            <div className="dashboard-stats">
                {cards.map(({ to, title, desc, Icon }) => (
                    <Link key={to} to={to} className="stat-card">
                        <div className="stat-icon admin-stat-ico">
                            <Icon size={22} aria-hidden />
                        </div>
                        <div className="stat-info">
                            <h3>{title}</h3>
                            <p className="stat-number">{desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="dashboard-welcome">
                <h2>Welcome to Minjal Salon Admin</h2>
                <p>Everything you need to run the website for your salon in one place.</p>
                <ul className="dashboard-checklist">
                    {checklist.map((text) => (
                        <li key={text}>
                            <HiOutlineCheckCircle className="dashboard-checklist-icon" size={18} aria-hidden />
                            <span>{text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
