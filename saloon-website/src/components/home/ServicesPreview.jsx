import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ServicesPreview.css";
import { homeContentAPI } from "../../services/api";
import { FiArrowRight } from "react-icons/fi";
import { FaCut, FaGem, FaHandSparkles, FaRing, FaSpa, FaStar } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";

function renderServiceIcon(iconValue, title) {
  const key = (iconValue || "").trim();
  const t = (title || "").toLowerCase();

  if (t.includes("hair")) return <FaCut aria-hidden="true" />;
  if (t.includes("nail")) return <FaHandSparkles aria-hidden="true" />;
  if (t.includes("skin") || t.includes("spa")) return <FaSpa aria-hidden="true" />;
  if (t.includes("bridal") || t.includes("makeup")) return <FaRing aria-hidden="true" />;

  // Fallback mapping if the backend stores emoji-like keys
  if (key === "✂") return <FaCut aria-hidden="true" />;
  if (key === "💅") return <FaHandSparkles aria-hidden="true" />;
  if (key === "✨") return <FaGem aria-hidden="true" />;
  if (key === "👰") return <FaRing aria-hidden="true" />;

  return <FaStar aria-hidden="true" />;
}

const defaultServices = [
  {
    id: 1,
    title: "Hair Styling",
    description: "Precision cuts, styling & treatments",
    icon: "✂",
    image_url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Nail Care",
    description: "Luxury manicure & pedicure services",
    icon: "💅",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Skin & Spa",
    description: "Relaxing facials & skin therapies",
    icon: "✨",
    image_url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Bridal Makeup",
    description: "Exquisite bridal beauty packages",
    icon: "👰",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function ServicesPreview() {
  const [activeService, setActiveService] = useState(0);
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await homeContentAPI.getServices();
        const data = response.data.data;
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Use default services
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="services-preview section" id="services-preview">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-badge fade-in">
            <span className="badge-icon" aria-hidden="true">
              <FaWandMagicSparkles />
            </span>
            <span className="badge-text">Our Expertise</span>
            <span className="badge-icon" aria-hidden="true">
              <FaWandMagicSparkles />
            </span>
          </span>
          <h2 className="section-title fade-in-up">
            Signature <span className="highlight-gold">Services</span>
          </h2>
          <p className="section-subtitle fade-in-up">
            Discover our curated selection of premium beauty and grooming services,
            crafted to perfection by our expert team
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`service-card ${activeService === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveService(index)}
              onTouchStart={() => setActiveService(index)}
            >
              <div className="service-card-image">
                <img src={service.image_url} alt={service.title} loading="lazy" />
                <div className="service-card-overlay"></div>
              </div>

              <div className="service-card-content">
                <div className="service-icon">{renderServiceIcon(service.icon, service.title)}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.description}</p>

                <Link to="/services" className="service-link">
                  <span>Explore More</span>
                  <FiArrowRight size={20} aria-hidden="true" />
                </Link>
              </div>

              {/* Decorative Corner */}
              <div className="service-corner"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="services-cta fade-in">
          <p className="cta-text">
            Ready to experience luxury? Explore our complete range of services
          </p>
          <Link to="/services" className="btn-primary btn-lg">
            <span>View All Services</span>
            <FiArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
