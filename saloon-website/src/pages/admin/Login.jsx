import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(credentials);

        if (result.success) {
            toast.success('Login successful!');
            navigate('/admin/dashboard');
        } else {
            toast.error(result.error || 'Login failed');
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-brand-icon" aria-hidden>
                            <HiOutlineShieldCheck size={40} />
                        </div>
                        <h1>Admin Login</h1>
                        <p>Minjal Salon Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@minjalsalon.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Default credentials:</p>
                        <p><strong>Email:</strong> admin@minjalsalon.com</p>
                        <p><strong>Password:</strong> Admin@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
