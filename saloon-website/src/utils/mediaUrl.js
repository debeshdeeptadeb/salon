import { API_ORIGIN } from '../services/api';

/**
 * Build a full URL for uploaded media (/uploads/...).
 * Handles absolute URLs and missing/leading-slash paths.
 */
export function resolveMediaUrl(pathOrUrl) {
    if (!pathOrUrl) return null;
    const value = String(pathOrUrl).trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    const path = value.startsWith('/') ? value : `/${value}`;
    return `${API_ORIGIN}${path}`;
}
