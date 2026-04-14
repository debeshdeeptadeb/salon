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
  const [error, setError] = useState("");
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
    }
  };

  const useNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        runSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setError("Could not access your location. Please allow location permission.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const openBooking = (service, salon) => {
    localStorage.setItem("publicSalonSlug", salon.slug);
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <section className="discovery-search section">
      <div className="container">
        <div className="discovery-search-header">
          <h2>Find Salon, Service & Location</h2>
          <p>Search all services/treatments and nearby salon locations.</p>
        </div>

        <form className="discovery-search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search salon name or service (e.g. haircut, facial)"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search location (street, road, city)"
          />
          <button type="submit" className="btn-primary">
            <FaMagnifyingGlass />
            Search
          </button>
          <button type="button" className="btn-secondary" onClick={useNearMe}>
            <FaLocationCrosshairs />
            Near Me
          </button>
        </form>

        {loading && <p className="discovery-note">Searching salons...</p>}
        {error && <p className="discovery-error">{error}</p>}

        <div className="discovery-results">
          {results.map((salon) => (
            <article key={salon.id} className="discovery-card">
              <div className="discovery-card-top">
                <h3>{salon.name}</h3>
                <p>
                  {[salon.area, salon.city, salon.state, salon.pincode].filter(Boolean).join(", ") || "Location not added"}
                </p>
                {salon.distance_km !== null && (
                  <span className="distance-pill">{Number(salon.distance_km).toFixed(1)} km away</span>
                )}
              </div>

              <div className="discovery-services-list">
                {(salon.matched_services || []).slice(0, 4).map((svc) => (
                  <div className="discovery-service-item" key={svc.id}>
                    <div>
                      <strong>{svc.name}</strong>
                      <span> {svc.duration} mins</span>
                    </div>
                    <button className="btn-primary btn-sm" onClick={() => openBooking(svc, salon)}>
                      Book Slot
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {!loading && results.length === 0 && <p className="discovery-note">No matching salons/services found yet.</p>}
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
