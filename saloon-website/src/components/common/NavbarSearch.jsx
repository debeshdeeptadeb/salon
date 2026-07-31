import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaScissors,
  FaLocationDot,
  FaStore,
} from "react-icons/fa6";
import { salonsAPI } from "../../services/api";
import BookingModal from "./BookingModal";
import {
  formatSalonAddress,
  getSalonMapsUrl,
  getStoredSalonSlug,
  hasExplicitSalonPick,
} from "../../utils/salonLocation";
import "./NavbarSearch.css";

const MIN_QUERY_LENGTH = 2;

function filterDirectory(salons, q) {
  const term = q.trim().toLowerCase();
  if (!term) return salons;
  return salons.filter((s) => {
    const blob = [s.name, s.area, s.city, s.state, s.pincode, s.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return blob.includes(term);
  });
}

export default function NavbarSearch({ className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pinnedSalon, setPinnedSalon] = useState(null);
  const [explicitPick, setExplicitPick] = useState(hasExplicitSalonPick);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const directoryLoadedRef = useRef(false);
  const skipOpenOnFocusRef = useRef(false);
  const navigate = useNavigate();

  const resolvePinnedFromDirectory = useCallback((list) => {
    const slug = getStoredSalonSlug();
    const found = list.find((s) => String(s.slug) === String(slug));
    if (found) setPinnedSalon(found);
    else if (!hasExplicitSalonPick()) setPinnedSalon(null);
  }, []);

  const loadDirectory = useCallback(async () => {
    if (directoryLoadedRef.current && directory.length) return directory;
    setDirectoryLoading(true);
    try {
      const res = await salonsAPI.directory();
      const list = res.data.data || [];
      directoryLoadedRef.current = true;
      setDirectory(list);
      resolvePinnedFromDirectory(list);
      return list;
    } catch {
      return [];
    } finally {
      setDirectoryLoading(false);
    }
  }, [directory.length, resolvePinnedFromDirectory]);

  // Resolve pinned salon name lightly on mount (no full directory wait for first paint)
  useEffect(() => {
    let cancelled = false;
    const slug = getStoredSalonSlug();
    if (!hasExplicitSalonPick() || !slug) return;
    // Prefer cached directory; otherwise fetch once in background
    if (directory.length) {
      resolvePinnedFromDirectory(directory);
      return;
    }
    salonsAPI
      .directory()
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        directoryLoadedRef.current = true;
        setDirectory(list);
        resolvePinnedFromDirectory(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once on mount / when slug pick changes
  }, [explicitPick]);

  useEffect(() => {
    const sync = () => {
      setExplicitPick(hasExplicitSalonPick());
      if (directory.length) resolvePinnedFromDirectory(directory);
    };
    window.addEventListener("publicSalonChanged", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("publicSalonChanged", sync);
      window.removeEventListener("storage", sync);
    };
  }, [directory, resolvePinnedFromDirectory]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const enrichSalon = useCallback(
    (salon) => {
      if (!salon) return salon;
      if (salon.google_maps_url) return salon;
      const fromDir = directory.find(
        (d) => d.id === salon.id || String(d.slug) === String(salon.slug)
      );
      return fromDir ? { ...salon, google_maps_url: fromDir.google_maps_url } : salon;
    },
    [directory]
  );

  const searchDiscover = async (q) => {
    const cleanQuery = q.trim();
    if (!cleanQuery || cleanQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await salonsAPI.discover({ q: cleanQuery });
      if (requestId !== requestIdRef.current) return;
      const data = (res.data.data || []).map(enrichSalon);
      setResults(data);
      setHasSearched(true);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setHasSearched(true);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const browseList = useMemo(() => {
    const q = query.trim();
    if (q.length >= MIN_QUERY_LENGTH && hasSearched) {
      return results;
    }
    return filterDirectory(directory, q);
  }, [query, hasSearched, results, directory]);

  const showBrowseMode = !query.trim() || query.trim().length < MIN_QUERY_LENGTH || !hasSearched;

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    const cleanVal = val.trim();
    if (!cleanVal || cleanVal.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      setIsOpen(true);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    debounceRef.current = setTimeout(() => searchDiscover(val), 380);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    const clean = query.trim();
    if (clean.length >= MIN_QUERY_LENGTH) {
      searchDiscover(query);
      setIsOpen(true);
    } else {
      setIsOpen(true);
      loadDirectory();
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (skipOpenOnFocusRef.current) return;
    setIsOpen(true);
    loadDirectory();
  };

  const setPublicSalon = (salon) => {
    if (!salon?.slug) return;
    localStorage.setItem("publicSalonSlug", salon.slug);
    setExplicitPick(true);
    setPinnedSalon(enrichSalon(salon));
    window.dispatchEvent(new Event("publicSalonChanged"));
  };

  const clearPinnedSalon = () => {
    localStorage.removeItem("publicSalonSlug");
    setExplicitPick(false);
    setPinnedSalon(null);
    window.dispatchEvent(new Event("publicSalonChanged"));
  };

  const selectSalon = (salon) => {
    setPublicSalon(salon);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
    skipOpenOnFocusRef.current = true;
    inputRef.current?.blur();
    window.setTimeout(() => {
      skipOpenOnFocusRef.current = false;
    }, 250);
  };

  const openBooking = (service, salon) => {
    setPublicSalon(salon);
    setSelectedService(service);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const goToServices = (salon) => {
    selectSalon(salon);
    navigate("/services");
  };

  const renderLocationLine = (salon, address, extraClass = "") => {
    const mapsUrl = getSalonMapsUrl(salon);
    if (!address) {
      return <span className={`nsd-salon-loc muted${extraClass ? ` ${extraClass}` : ""}`}>Location on file</span>;
    }
    return (
      <span className={`nsd-salon-loc${extraClass ? ` ${extraClass}` : ""}`}>
        <FaLocationDot aria-hidden />
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nsd-loc-link"
            onClick={(e) => e.stopPropagation()}
            title="Open location in Google Maps"
          >
            {address}
          </a>
        ) : (
          address
        )}
        {salon.distance_km != null && (
          <span className="nsd-dist">{Number(salon.distance_km).toFixed(1)} km</span>
        )}
      </span>
    );
  };

  const renderSalonCard = (salon, { isBrowse } = { isBrowse: false }) => {
    const address = formatSalonAddress(salon);
    const isActive =
      explicitPick && pinnedSalon && String(pinnedSalon.slug) === String(salon.slug);

    return (
      <div
        key={salon.id}
        className={`nsd-salon-card${isActive ? " nsd-salon-card-active" : ""}`}
        role="option"
        aria-selected={isActive}
      >
        <div className="nsd-salon-header">
          <div className="nsd-salon-meta">
            <span className="nsd-salon-name">{salon.name}</span>
            {renderLocationLine(salon, address)}
          </div>
          <div className="nsd-salon-actions">
            <button
              type="button"
              className="nsd-select-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectSalon(salon);
              }}
              title={`Show ${salon.name} across the website`}
            >
              {isActive ? "Selected" : "Select salon"}
            </button>
            <button
              type="button"
              className="nsd-view-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToServices(salon);
              }}
              title={`View all services at ${salon.name}`}
            >
              Services →
            </button>
          </div>
        </div>

        {!isBrowse && (salon.matched_services || []).length > 0 && (
          <div className="nsd-services-list">
            {(salon.matched_services || []).slice(0, 4).map((svc) => (
              <div key={svc.id} className="nsd-service-row">
                <div className="nsd-svc-info">
                  <span className="nsd-svc-name">{svc.name}</span>
                  <span className="nsd-svc-meta">
                    {svc.duration ? `${svc.duration} mins` : null}
                    {svc.price != null && (
                      <>
                        {svc.duration ? " · " : ""}
                        <strong>₹{svc.price}</strong>
                      </>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="nsd-book-btn"
                  onClick={() => openBooking(svc, salon)}
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}

        {!isBrowse && !(salon.matched_services || []).length && (
          <p className="nsd-no-svc">No matching services — select salon to browse their site.</p>
        )}
      </div>
    );
  };

  return (
    <div className={`nsearch-wrap${className ? ` ${className}` : ""}`} ref={containerRef}>
      <form className="nsearch-form" onSubmit={handleSubmit} role="search">
        <FaMagnifyingGlass className="nsearch-icon-left" aria-hidden />
        {explicitPick && pinnedSalon && (
          <span className="nsearch-inline-salon">
            <FaStore aria-hidden />
            <button
              type="button"
              className="nsearch-inline-salon-name"
              onClick={() => {
                setIsOpen(true);
                loadDirectory();
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
              title="Change salon"
            >
              {pinnedSalon.name}
            </button>
            <button
              type="button"
              className="nsearch-inline-salon-clear"
              onClick={clearPinnedSalon}
              aria-label="Clear selected salon"
              title="Clear salon"
            >
              <FaXmark />
            </button>
          </span>
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={
            pinnedSalon && explicitPick
              ? "Search services or another salon…"
              : "Search salon, location, service, or price…"
          }
          className="nsearch-input"
          aria-label="Search salons, services, and prices"
          autoComplete="off"
        />
        {(loading || directoryLoading) && <span className="nsearch-spinner" aria-hidden="true" />}
        {query && !loading && (
          <button
            type="button"
            className="nsearch-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FaXmark />
          </button>
        )}
        <button type="submit" className="nsearch-btn" aria-label="Search">
          Search
        </button>
      </form>

      {isOpen && (
        <div className="nsearch-dropdown" role="listbox" aria-label="Salon search results">
          {showBrowseMode && !directoryLoading && browseList.length > 0 && (
            <p className="nsd-hint">
              <FaStore aria-hidden /> Browse salons or search by name, area, service, or price (e.g. 699)
            </p>
          )}

          {(loading || (showBrowseMode && directoryLoading)) && (
            <div className="nsd-status">
              <span className="nsd-spinner-lg" aria-hidden />
              {showBrowseMode ? "Loading salons…" : "Searching…"}
            </div>
          )}

          {!loading && !directoryLoading && hasSearched && !showBrowseMode && browseList.length === 0 && (
            <div className="nsd-empty">
              <FaScissors className="nsd-empty-icon" aria-hidden />
              <p>
                No salons or services found for <strong>&quot;{query}&quot;</strong>
              </p>
              <span>Try another salon name, location, service, or price.</span>
            </div>
          )}

          {!loading && !directoryLoading && browseList.length === 0 && showBrowseMode && (
            <div className="nsd-empty">
              <p>No salons registered yet.</p>
            </div>
          )}

          {!loading &&
            !directoryLoading &&
            browseList.map((salon) =>
              renderSalonCard(salon, { isBrowse: showBrowseMode })
            )}
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </div>
  );
}
