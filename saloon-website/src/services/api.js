import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Backend origin for static files (e.g. /uploads). VITE_API_URL is the API base and often ends with /api. */
export const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/?api\/?$/, '') || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tenant: public requests use ?salon=slug; super admins send X-Salon-Id for the active salon
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        const url = config.url || '';

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            try {
                const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
                if (adminUser?.role === 'super_admin') {
                    const sid = localStorage.getItem('superAdminSalonId');
                    if (sid) config.headers['X-Salon-Id'] = sid;
                }
            } catch {
                /* ignore */
            }
        } else if (!url.includes('/auth/') && !url.includes('/salons/public/')) {
            const slug =
                localStorage.getItem('publicSalonSlug') ||
                import.meta.env.VITE_DEFAULT_SALON_SLUG ||
                'default';
            config.params = { ...config.params, salon: slug };
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('superAdminSalonId');
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// =============================================
// PLATFORM / SALONS (super admin)
// =============================================
export const salonsAPI = {
    list: () => api.get('/salons'),
    create: (data) => api.post('/salons', data),
    getPublic: (slug) => api.get(`/salons/public/${slug}`),
};

export const salonStaffAPI = {
    list: (salonId) => api.get('/salon-staff', { params: { salonId } }),
    create: (data) => api.post('/salon-staff', data),
    delete: (id) => api.delete(`/salon-staff/${id}`),
};

// =============================================
// AUTH API
// =============================================
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// =============================================
// SERVICES API
// =============================================
export const servicesAPI = {
    getAll: (category) => api.get('/services', { params: { category } }),
    getOne: (id) => api.get(`/services/${id}`),
    create: (formData) => api.post('/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/services/${id}`),
    getCategories: () => api.get('/services/categories/all'),
    createCategory: (data) => api.post('/services/categories', data),
    updateCategory: (id, data) => api.put(`/services/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/services/categories/${id}`),
};

// =============================================
// CATALOGUE API
// =============================================
export const catalogueAPI = {
    getAll: () => api.get('/catalogue'),
    getOne: (id) => api.get(`/catalogue/${id}`),
    create: (formData) => api.post('/catalogue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/catalogue/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/catalogue/${id}`),
};

// =============================================
// GALLERY API
// =============================================
export const galleryAPI = {
    getAll: () => api.get('/gallery'),
    upload: (formData) => api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, data) => api.put(`/gallery/${id}`, data),
    delete: (id) => api.delete(`/gallery/${id}`),
};

// =============================================
// OFFERS API
// =============================================
export const offersAPI = {
    getActive: () => api.get('/offers/active'),
    getAll: () => api.get('/offers'),
    create: (data) => api.post('/offers', data),
    update: (id, data) => api.put(`/offers/${id}`, data),
    delete: (id) => api.delete(`/offers/${id}`),
};

// =============================================
// CONTENT API
// =============================================
export const contentAPI = {
    getAbout: () => api.get('/content/about'),
    updateAbout: (data) => api.put('/content/about', data),
};

// =============================================
// SETTINGS API
// =============================================
export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.put('/settings', data),
    uploadLogo: (formData) => api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadUpiQR: (formData) => api.post('/settings/upi-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// =============================================
// HOME CONTENT API
// =============================================
export const homeContentAPI = {
    getHero: () => api.get('/home/hero'),
    updateHero: (data) => api.put('/home/hero', data),
    getServices: () => api.get('/home/services'),
    updateServices: (data) => api.put('/home/services', data),
    uploadServiceImage: (formData) => api.post('/home/services/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getPrices: () => api.get('/home/prices'),
    updatePrices: (data) => api.put('/home/prices', data)
};

// =============================================
// ENQUIRIES API
// =============================================
export const enquiriesAPI = {
    submit: (data) => api.post('/enquiries', data),
    getAll: (resolved) => api.get('/enquiries', { params: { resolved } }),
    resolve: (id) => api.put(`/enquiries/${id}/resolve`),
    delete: (id) => api.delete(`/enquiries/${id}`),
};

// =============================================
// BOOKINGS API
// =============================================
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getAll: (filters) => api.get('/bookings', { params: filters }),
    getOne: (id) => api.get(`/bookings/${id}`),
    updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
    markPaid: (id) => api.patch(`/bookings/${id}/mark-paid`),
    delete: (id) => api.delete(`/bookings/${id}`),
    getStats: () => api.get('/bookings/stats'),
};

// =============================================
// QR CODE API
// =============================================
export const qrAPI = {
    generate: (data) => api.post('/qr/generate', data),
    getAll: () => api.get('/qr'),
    getOne: (id) => api.get(`/qr/${id}`),
    delete: (id) => api.delete(`/qr/${id}`),
    toggle: (id) => api.patch(`/qr/${id}/toggle`),
    getServicesByQRCode: (qrCodeId) => api.get(`/qr/${qrCodeId}/services`),
};

export default api;
