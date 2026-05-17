/** Format salon address from directory/discover row. */
export function formatSalonAddress(s) {
  if (!s) return "";
  const parts = [s.area, s.city, s.state, s.pincode].filter(Boolean);
  return parts.join(", ");
}

export function getDefaultSalonSlug() {
  return import.meta.env.VITE_DEFAULT_SALON_SLUG || "default";
}

export function getStoredSalonSlug() {
  if (typeof window === "undefined") return getDefaultSalonSlug();
  return localStorage.getItem("publicSalonSlug") || getDefaultSalonSlug();
}

export function hasExplicitSalonPick() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("publicSalonSlug");
}

/** URL to open salon location in Google Maps (admin link, coordinates, or address search). */
export function getSalonMapsUrl(salon) {
  if (!salon) return null;
  const adminUrl = salon.google_maps_url?.trim();
  if (adminUrl && /^https?:\/\//i.test(adminUrl)) return adminUrl;

  const lat = parseFloat(salon.latitude);
  const lng = parseFloat(salon.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const address = formatSalonAddress(salon);
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return null;
}
