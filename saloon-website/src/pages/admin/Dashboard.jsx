import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import SalonSwitcher from '../../components/admin/SalonSwitcher';
import '../../styles/admin-ui.css';
import './Dashboard.css';
import './AdminStyles.css';

export default function Dashboard() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <SalonSwitcher />
                <Outlet />
            </main>
        </div>
    );
}
