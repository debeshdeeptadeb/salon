import { useState, useEffect } from "react";
import { servicesAPI, API_ORIGIN } from "../services/api";
import BookingModal from "../components/common/BookingModal";
import "./Services.css";

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesAPI.getAll(),
        servicesAPI.getCategories(),
      ]);
      setServices(servicesRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category_id === parseInt(activeCategory));

  // Handle booking modal
  const handleBookNow = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <section className="services-page">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-content">
            <span className="page-badge fade-in">
              <span className="badge-icon">✦</span>
              <span className="badge-text">Our Expertise</span>
              <span className="badge-icon">✦</span>
            </span>
            <h1 className="page-title fade-in-up">
              Premium <span className="highlight-gold">Services</span>
            </h1>
            <p className="page-subtitle fade-in-up">
              Discover our curated selection of luxury beauty and grooming services,
              crafted to perfection by our expert team
            </p>
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="services-content section">
        <div className="container">
          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`category-btn ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id.toString() ? "active" : ""
                  }`}
                onClick={() => setActiveCategory(category.id.toString())}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="services-grid-page">
            {filteredServices.map((service) => (
              <div key={service.id} className="service-card-page">
                {service.image_url && (
                  <div className="service-image">
                    <img
                      src={`${API_ORIGIN}${service.image_url}`}
                      alt={service.name}
                      loading="lazy"
                    />
                    <div className="service-overlay"></div>
                  </div>
                )}

                <div className="service-content">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>
                    {service.is_featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>

                  {service.description && (
                    <p className="service-description">{service.description}</p>
                  )}

                  <div className="service-footer">
                    <div className="service-details">
                      <div className="service-price">
                        <span className="price-label">From</span>
                        <span className="price-value">₹{service.price}</span>
                      </div>
                      <div className="service-duration">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{service.duration} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookNow(service)}
                      className="btn-primary btn-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="empty-state">
              <p>No services found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="services-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Luxury?</h2>
            <p>Book your appointment today and let our experts take care of you</p>
            <a
              href="https://wa.me/919337720521"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Book on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </section>
  );
}
