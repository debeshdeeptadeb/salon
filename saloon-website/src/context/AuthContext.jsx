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
        let cancelled = false;

        async function hydrateUser() {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getMe();
                if (cancelled) return;
                const userData = response.data?.data;
                if (userData) {
                    const stored = localStorage.getItem('adminUser');
                    let prev = {};
                    try {
                        prev = stored ? JSON.parse(stored) : {};
                    } catch {
                        prev = {};
                    }
                    const merged = { ...prev, ...userData };
                    localStorage.setItem('adminUser', JSON.stringify(merged));
                    setUser(merged);

                    if (merged.role === 'super_admin') {
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
                }
            } catch {
                if (cancelled) return;
                const savedUser = localStorage.getItem('adminUser');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        hydrateUser();
        return () => {
            cancelled = true;
        };
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
