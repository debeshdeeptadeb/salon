import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { FaChevronDown, FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { salonsAPI } from "../../services/api";
import "./SalonPicker.css";

function formatAddress(s) {
  const parts = [s.area, s.city, s.state, s.pincode].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

function getStoredSlug() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("publicSalonSlug") ||
    import.meta.env.VITE_DEFAULT_SALON_SLUG ||
    "default"
  );
}

export default function SalonPicker() {
  const [salons, setSalons] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [explicitPick, setExplicitPick] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("publicSalonSlug")
  );
  const [activeSlug, setActiveSlug] = useState(() => getStoredSlug());
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const loadDirectory = useCallback(async () => {
    setLoadError("");
    try {
      const res = await salonsAPI.directory();
      setSalons(res.data.data || []);
    } catch {
      setLoadError("Salon list is unavailable right now.");
      setSalons([]);
    }
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  useEffect(() => {
    const syncSlug = () => {
      setActiveSlug(getStoredSlug());
      setExplicitPick(!!localStorage.getItem("publicSalonSlug"));
    };
    window.addEventListener("publicSalonChanged", syncSlug);
    window.addEventListener("storage", syncSlug);
    return () => {
      window.removeEventListener("publicSalonChanged", syncSlug);
      window.removeEventListener("storage", syncSlug);
    };
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = useMemo(
    () => salons.find((s) => String(s.slug) === String(activeSlug)) || null,
    [salons, activeSlug]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return salons;
    return salons.filter((s) => {
      const blob = [s.name, s.area, s.city, s.state, s.pincode, s.slug]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [salons, query]);

  const applySalon = (slug) => {
    if (!slug) return;
    localStorage.setItem("publicSalonSlug", slug);
    setExplicitPick(true);
    setActiveSlug(slug);
    setOpen(false);
    setQuery("");
    window.dispatchEvent(new Event("publicSalonChanged"));
  };

  const clearSalon = () => {
    localStorage.removeItem("publicSalonSlug");
    setExplicitPick(false);
    setActiveSlug(getStoredSlug());
    setOpen(false);
    setQuery("");
    window.dispatchEvent(new Event("publicSalonChanged"));
  };

  const displayLabel = selected
    ? `${selected.name}${formatAddress(selected) ? ` — ${formatAddress(selected)}` : ""}`
    : "Choose your salon";

  return (
    <div className="salon-picker" ref={wrapRef}>
      <p className="salon-picker-label">Visit a location</p>
      <div className="salon-picker-control">
        <button
          type="button"
          className="salon-picker-trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) {
              setQuery("");
              queueMicrotask(() => inputRef.current?.focus());
            }
          }}
        >
          <span className="salon-picker-trigger-text">{displayLabel}</span>
          <FaChevronDown className={`salon-picker-chevron${open ? " salon-picker-chevron-open" : ""}`} aria-hidden />
        </button>

        {open && (
          <div className="salon-picker-dropdown" role="listbox" aria-label="Salons">
            <div className="salon-picker-search">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, area, city…"
                autoComplete="off"
                aria-label="Filter salons"
              />
            </div>
            {loadError && <p className="salon-picker-msg salon-picker-msg-error">{loadError}</p>}
            {!loadError && filtered.length === 0 && (
              <p className="salon-picker-msg">No salons match your search.</p>
            )}
            <ul className="salon-picker-list">
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(s.slug) === String(activeSlug)}
                    className={`salon-picker-option${String(s.slug) === String(activeSlug) ? " is-active" : ""}`}
                    onClick={() => applySalon(s.slug)}
                  >
                    <span className="salon-picker-option-name">{s.name}</span>
                    {formatAddress(s) ? (
                      <span className="salon-picker-option-loc">
                        <FaLocationDot aria-hidden />
                        {formatAddress(s)}
                      </span>
                    ) : (
                      <span className="salon-picker-option-loc muted">Location on file</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {explicitPick && (
              <div className="salon-picker-footer">
                <button type="button" className="salon-picker-reset" onClick={clearSalon}>
                  Use default site experience
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && formatAddress(selected) && (
        <div className="salon-picker-location-row">
          <FaMapLocationDot className="salon-picker-loc-icon" aria-hidden />
          <div className="salon-picker-location-text">
            <span className="salon-picker-location-label">This location</span>
            <span className="salon-picker-location-address">{formatAddress(selected)}</span>
          </div>
          {selected.google_maps_url ? (
            <a
              href={selected.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="salon-picker-maps-link"
            >
              Open in Google Maps
            </a>
          ) : (
            <span className="salon-picker-maps-missing" title="Admin can add a Google Maps link for this salon">
              Map link coming soon
            </span>
          )}
        </div>
      )}
    </div>
  );
}
