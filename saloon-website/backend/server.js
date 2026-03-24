import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Import database
import pool from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import servicesRoutes from './routes/services.routes.js';
import catalogueRoutes from './routes/catalogue.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import offersRoutes from './routes/offers.routes.js';
import contentRoutes from './routes/content.routes.js';
import enquiriesRoutes from './routes/enquiries.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import homeContentRoutes from './routes/homeContent.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import qrRoutes from './routes/qr.routes.js';
import salonsRoutes from './routes/salons.routes.js';
import salonStaffRoutes from './routes/salonStaff.routes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// =============================================
// MIDDLEWARE
// =============================================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 400),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please try again shortly.',
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts. Please wait and retry.',
    },
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Salon Management API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/home', homeContentRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/salons', salonsRoutes);
app.use('/api/salon-staff', salonStaffRoutes);

// =============================================
// ERROR HANDLING
// =============================================

app.use(notFound);
app.use(errorHandler);

// =============================================
// SERVER START
// =============================================

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please check your database configuration in .env file');
        process.exit(1);
    } else {
        console.log('✅ Database connected successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            const baseUrl = process.env.NODE_ENV === 'production'
                ? '(set by deployment URL)'
                : `http://localhost:${PORT}`;
            console.log(`📡 API available at ${baseUrl}/api`);
            console.log(`🏥 Health check: ${baseUrl}/api/health\n`);
        });
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});
