import { useState, useEffect } from "react";
import {
    HiOutlineChartBarSquare,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineSparkles,
    HiOutlineCalendarDays,
    HiOutlineInbox,
    HiOutlineBanknotes,
    HiOutlineTrash,
    HiOutlineCheckBadge,
} from "react-icons/hi2";
import { bookingsAPI } from "../../services/api";
import "./BookingsManagement.css";

export default function BookingsManagement() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "all",
        branch: "all",
        search: "",
    });

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [filters]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingsAPI.getAll(filters);
            setBookings(response.data.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await bookingsAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await bookingsAPI.updateStatus(bookingId, newStatus);
            fetchBookings();
            fetchStats();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update booking status");
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) {
            return;
        }

        try {
            await bookingsAPI.delete(bookingId);
            fetchBookings();
            fetchStats();
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("Failed to delete booking");
        }
    };

    const handleMarkPaid = async (bookingId) => {
        try {
            await bookingsAPI.markPaid(bookingId);
            fetchBookings();
        } catch (error) {
            console.error('Error marking as paid:', error);
            alert('Failed to mark booking as paid');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            pending: "status-pending",
            confirmed: "status-confirmed",
            completed: "status-completed",
            cancelled: "status-cancelled",
        };
        return statusClasses[status] || "status-pending";
    };

    return (
        <div className="admin-page bookings-management admin-ui-page">
            <div className="admin-ui-header">
                <h1>Bookings</h1>
                <p className="page-description">Appointments, payments, and status — all aligned to your selected tenant.</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="admin-stat-ico" aria-hidden>
                            <HiOutlineChartBarSquare />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_bookings || 0}</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="admin-stat-ico" aria-hidden>
                            <HiOutlineClock />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.pending || 0}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card confirmed">
                        <div className="admin-stat-ico" aria-hidden>
                            <HiOutlineCheckCircle />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.confirmed || 0}</h3>
                            <p>Confirmed</p>
                        </div>
                    </div>
                    <div className="stat-card completed">
                        <div className="admin-stat-ico" aria-hidden>
                            <HiOutlineSparkles />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.completed || 0}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card today">
                        <div className="admin-stat-ico" aria-hidden>
                            <HiOutlineCalendarDays />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.today_bookings || 0}</h3>
                            <p>Today's Bookings</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Branch:</label>
                    <select
                        value={filters.branch}
                        onChange={(e) => handleFilterChange("branch", e.target.value)}
                    >
                        <option value="all">All Branches</option>
                        <option value="Cuttack">Cuttack</option>
                        <option value="Bhubaneswar">Bhubaneswar</option>
                        <option value="Baripada">Baripada</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bookings-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="admin-empty-illustration" aria-hidden>
                            <HiOutlineInbox />
                        </div>
                        <h3>No bookings found</h3>
                        <p>No bookings match your current filters.</p>
                    </div>
                ) : (
                    <div className="bookings-table-wrapper admin-table-scroll">
                        <table className="bookings-table admin-table-pro">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Service</th>
                                    <th>Date & Time</th>
                                    <th>Branch</th>
                                    <th>Payment</th>
                                    <th>Booking status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="booking-id">#{booking.id}</td>
                                        <td className="customer-name">{booking.customer_name}</td>
                                        <td className="customer-contact">
                                            <div>{booking.customer_phone}</div>
                                            {booking.customer_email && (
                                                <div className="email">{booking.customer_email}</div>
                                            )}
                                        </td>
                                        <td className="service-info">
                                            <div className="service-name">{booking.service_name}</div>
                                            <div className="service-price">₹{booking.service_price}</div>
                                        </td>
                                        <td className="datetime">
                                            <div className="date">{formatDate(booking.booking_date)}</div>
                                            <div className="time">{formatTime(booking.booking_time)}</div>
                                        </td>
                                        <td className="branch">{booking.branch}</td>
                                        <td>
                                            <span className={`payment-badge ${booking.payment_status === 'paid' ? 'payment-paid' : 'payment-pending'}`}>
                                                {booking.payment_status === 'paid' ? (
                                                    <>
                                                        <HiOutlineBanknotes size={14} aria-hidden /> Paid
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiOutlineClock size={14} aria-hidden /> Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className={`status-select ${getStatusBadgeClass(booking.status)}`}
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="actions">
                                            {booking.payment_status !== 'paid' && (
                                                <button
                                                    type="button"
                                                    className="btn-mark-paid"
                                                    onClick={() => handleMarkPaid(booking.id)}
                                                    title="Mark as Paid"
                                                >
                                                    <HiOutlineCheckBadge size={16} aria-hidden />
                                                    Mark paid
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn-delete"
                                                onClick={() => handleDelete(booking.id)}
                                                title="Delete booking"
                                            >
                                                <HiOutlineTrash size={18} aria-hidden />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
