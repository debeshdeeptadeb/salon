import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaXmark, FaScissors, FaLocationDot } from "react-icons/fa6";
import { salonsAPI } from "../../services/api";
import BookingModal from "./BookingModal";
import "./NavbarSearch.css";

export default function NavbarSearch({ className = "" }) {
  const MIN_QUERY_LENGTH = 2;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const search = async (q) => {
    const cleanQuery = q.trim();
    if (!cleanQuery || cleanQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await salonsAPI.discover({ q: cleanQuery });
      if (requestId !== requestIdRef.current) return;
      const data = res.data.data || [];
      setResults(data);
      setHasSearched(true);
      setIsOpen(true);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setHasSearched(true);
      setIsOpen(true);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    const cleanVal = val.trim();
    if (!cleanVal || cleanVal.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(val), 380);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    search(query);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const openBooking = (service, salon) => {
    localStorage.setItem("publicSalonSlug", salon.slug);
    setSelectedService(service);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const goToServices = (salon) => {
    localStorage.setItem("publicSalonSlug", salon.slug);
    setIsOpen(false);
    setQuery("");
    setResults([]);
    navigate("/services");
  };

  return (
    <div className={`nsearch-wrap${className ? ` ${className}` : ""}`} ref={containerRef}>
      <form className="nsearch-form" onSubmit={handleSubmit} role="search">
        <FaMagnifyingGlass className="nsearch-icon-left" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (results.length > 0 || (hasSearched && query)) setIsOpen(true);
          }}
          placeholder="Search for salon, haircut, facial..."
          className="nsearch-input"
          aria-label="Search salons and services"
          autoComplete="off"
        />
        {loading && <span className="nsearch-spinner" aria-hidden="true" />}
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
        <div className="nsearch-dropdown" role="listbox">
          {loading && (
            <div className="nsd-status">
              <span className="nsd-spinner-lg" />
              Searching salons…
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="nsd-empty">
              <FaScissors className="nsd-empty-icon" />
              <p>No salons or services found for <strong>"{query}"</strong></p>
              <span>Try a different name or service keyword.</span>
            </div>
          )}

          {!loading && results.map((salon) => (
            <div key={salon.id} className="nsd-salon-card" role="option">
              <div className="nsd-salon-header">
                <div className="nsd-salon-meta">
                  <span className="nsd-salon-name">{salon.name}</span>
                  {(salon.area || salon.city) && (
                    <span className="nsd-salon-loc">
                      <FaLocationDot />
                      {[salon.area, salon.city].filter(Boolean).join(", ")}
                      {salon.distance_km != null && (
                        <span className="nsd-dist">{Number(salon.distance_km).toFixed(1)} km</span>
                      )}
                    </span>
                  )}
                </div>
                <button
                  className="nsd-view-btn"
                  onClick={() => goToServices(salon)}
                  title={`View all services at ${salon.name}`}
                >
                  All Services →
                </button>
              </div>

              {(salon.matched_services || []).length > 0 ? (
                <div className="nsd-services-list">
                  {(salon.matched_services || []).slice(0, 4).map((svc) => (
                    <div key={svc.id} className="nsd-service-row">
                      <div className="nsd-svc-info">
                        <span className="nsd-svc-name">{svc.name}</span>
                        <span className="nsd-svc-meta">
                          {svc.duration} mins
                          {svc.price && <> &middot; <strong>₹{svc.price}</strong></>}
                        </span>
                      </div>
                      <button
                        className="nsd-book-btn"
                        onClick={() => openBooking(svc, salon)}
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="nsd-no-svc">No services listed yet.</p>
              )}
            </div>
          ))}
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
