import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin user from database (with salon for multi-tenant)
            const result = await pool.query(
                `SELECT a.id, a.email, a.name, a.role, a.salon_id,
                        s.name AS salon_name, s.slug AS salon_slug
                 FROM admins a
                 LEFT JOIN salons s ON a.salon_id = s.id
                 WHERE a.id = $1`,
                [decoded.id]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            req.user = result.rows[0];
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        next(error);
    }
};
