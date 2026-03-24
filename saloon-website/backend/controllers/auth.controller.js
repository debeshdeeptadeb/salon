import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        const result = await pool.query(
            `SELECT a.*, s.name AS salon_name, s.slug AS salon_slug
             FROM admins a
             LEFT JOIN salons s ON a.salon_id = s.id
             WHERE a.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const admin = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin.id);

        res.status(200).json({
            success: true,
            data: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                salon_id: admin.salon_id,
                salon_name: admin.salon_name,
                salon_slug: admin.salon_slug,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
