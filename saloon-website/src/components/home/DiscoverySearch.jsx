import { useState } from "react";
import { FaLocationCrosshairs, FaMagnifyingGlass } from "react-icons/fa6";
import { salonsAPI } from "../../services/api";
import BookingModal from "../common/BookingModal";
import "./DiscoverySearch.css";

export default function DiscoverySearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const [usedGeolocation, setUsedGeolocation] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const runSearch = async (extra = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await salonsAPI.discover({
        q: query.trim(),
        location: location.trim(),
        ...extra,
      });
      setResults(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.error || "Unable to search right now.");
      setResults([]);
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  };

  const useNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setError("");
    setGeoLoading(true);
    setUsedGeolocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        runSearch({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setGeoLoading(false);
        setUsedGeolocation(false);
        const code = err?.code;
        if (code === 1) {
          setError("Location access was denied. Enable it in your browser settings to use Near Me.");
        } else if (code === 2) {
          setError("Your position could not be determined. Try again or search by city.");
        } else if (code === 3) {
          setError("Location request timed out. Try again or search by city.");
        } else {
          setError("Could not access your location. Check permissions and try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsedGeolocation(false);
    runSearch();
  };

  const openBooking = (service, salon) => {
    if (salon?.slug) {
      localStorage.setItem("publicSalonSlug", salon.slug);
      window.dispatchEvent(new Event("publicSalonChanged"));
    }
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const noDistanceData =
    usedGeolocation &&
    results.length > 0 &&
    results.every((s) => s.distance_km == null);

  return (
    <section className="discovery-search section" aria-labelledby="discovery-heading">
      <div className="container">
        <div className="discovery-shell">
          <div className="discovery-search-header">
            <p className="discovery-eyebrow">Smart booking</p>
            <h2 id="discovery-heading">Find salon, service &amp; location</h2>
            <p className="discovery-lead">
              Search by treatment or name, filter by area, or use your location to see nearby salons.
            </p>
          </div>

          <form className="discovery-search-form" onSubmit={handleSubmit} noValidate>
            <div className="discovery-field">
              <label className="discovery-label" htmlFor="discovery-q">
                Service or salon
              </label>
              <input
                id="discovery-q"
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. haircut, facial, Minjal"
                title="Search by salon name, service, or category"
                autoComplete="off"
                enterKeyHint="search"
              />
            </div>
            <div className="discovery-field">
              <label className="discovery-label" htmlFor="discovery-loc">
                City or area
              </label>
              <input
                id="discovery-loc"
                type="text"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street, city, or pincode"
                title="Narrow results by location text"
                autoComplete="address-level2"
              />
            </div>
            <div className="discovery-actions">
              <button
                type="submit"
                className="discovery-btn discovery-btn-primary"
                disabled={loading}
              >
                {loading && !geoLoading ? (
                  <span className="discovery-btn-spinner" aria-hidden />
                ) : (
                  <FaMagnifyingGlass aria-hidden />
                )}
                {loading && !geoLoading ? "Searching…" : "Search"}
              </button>
              <button
                type="button"
                className="discovery-btn discovery-btn-geo"
                onClick={useNearMe}
                disabled={loading || geoLoading}
                title="Use device location to sort salons by distance"
              >
                {geoLoading ? (
                  <span className="discovery-btn-spinner" aria-hidden />
                ) : (
                  <FaLocationCrosshairs aria-hidden />
                )}
                {geoLoading ? "Locating…" : "Near me"}
              </button>
            </div>
          </form>
        </div>

        {(loading || geoLoading) && (
          <p className="discovery-status discovery-status-loading" role="status">
            {geoLoading ? "Getting your location…" : "Searching salons…"}
          </p>
        )}
        {error && (
          <p className="discovery-error" role="alert">
            {error}
          </p>
        )}
        {noDistanceData && (
          <p className="discovery-hint" role="note">
            Salons are ordered for your area. Distances show once each salon has map coordinates set in
            the platform admin.
          </p>
        )}

        <div className="discovery-results">
          {results.map((salon) => (
            <article key={salon.id} className="discovery-card">
              <div className="discovery-card-top">
                <div className="discovery-card-title-row">
                  <h3>{salon.name}</h3>
                  {salon.distance_km !== null && salon.distance_km !== undefined && (
                    <span className="distance-pill">{Number(salon.distance_km).toFixed(1)} km</span>
                  )}
                </div>
                <p className="discovery-card-address">
                  {[salon.area, salon.city, salon.state, salon.pincode].filter(Boolean).join(", ") ||
                    "Location on file"}
                </p>
              </div>

              <div className="discovery-services-list">
                {(salon.matched_services || []).slice(0, 4).map((svc) => (
                  <div className="discovery-service-item" key={`${salon.id}-${svc.id}`}>
                    <div>
                      <strong>{svc.name}</strong>
                      <span>{svc.duration} min</span>
                    </div>
                    <button
                      type="button"
                      className="discovery-book-btn"
                      onClick={() => openBooking(svc, salon)}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {!loading && !geoLoading && results.length === 0 && (
          <p className="discovery-empty">No matching salons yet — try another keyword or Near me.</p>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </section>
  );
}
