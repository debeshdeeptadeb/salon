import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, salonsAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('adminToken');
        const savedUser = localStorage.getItem('adminUser');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, ...userData } = response.data.data;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            setUser(userData);

            if (userData.role === 'super_admin') {
                try {
                    const res = await salonsAPI.list();
                    const salons = res.data.data || [];
                    if (salons.length && !localStorage.getItem('superAdminSalonId')) {
                        localStorage.setItem('superAdminSalonId', String(salons[0].id));
                    }
                } catch {
                    /* ignore */
                }
            } else {
                localStorage.removeItem('superAdminSalonId');
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('superAdminSalonId');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
