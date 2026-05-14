import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { FaClock, FaMedal, FaRegSmile, FaWhatsapp } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { HiOutlineScissors, HiOutlineSparkles, HiOutlineFaceSmile } from "react-icons/hi2";
import "./Hero.css";
import { homeContentAPI } from "../../services/api";
import SalonPicker from "./SalonPicker";
import { useOnPublicSalonChange } from "../../hooks/useOnPublicSalonChange";

const trendingServices = [
    { id: 1, title: "Haircut + Styling", duration: "45 min", price: 699, Icon: HiOutlineScissors, badge: "Most loved" },
    { id: 2, title: "Glow Facial", duration: "60 min", price: 1199, Icon: HiOutlineSparkles, badge: "Editor's pick" },
    { id: 3, title: "Beard + Cleanup", duration: "30 min", price: 499, Icon: HiOutlineFaceSmile, badge: "Quick & easy" },
];

export default function Hero() {
  const navigate = useNavigate();
  const WA_PHONE = "919337720521";
  const BOOKING_MESSAGE = "Hello Minjal Salon! I want to book an appointment. Please share available time slots. Thank you!";
  const WA_BOOK_LINK = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(BOOKING_MESSAGE)}`;

  const [heroData, setHeroData] = useState({
    badge_text: "Bhubaneswar's Premier Luxury Salon",
    title_main: "Where Elegance Meets Expert Care",
    title_highlight: "Elegance",
    subtitle: "Experience world-class beauty and grooming services in an atmosphere of refined luxury. Your transformation begins here.",
    stat_years: 10,
    stat_clients: 5000,
    stat_services: 50
  });

  useOnPublicSalonChange(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await homeContentAPI.getHero();
        setHeroData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
        // Use default values
      }
    };
    fetchHeroContent();
  });

  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-bg-shapes">
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="hero-shape hero-shape-3"></div>
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          <SalonPicker />

          {/* Luxury Badge */}
          <div className="hero-badge fade-in">
            <span className="badge-icon" aria-hidden="true">
              <FaWandMagicSparkles />
            </span>
            <span className="badge-text">{heroData.badge_text}</span>
            <span className="badge-icon" aria-hidden="true">
              <FaWandMagicSparkles />
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-title fade-in-up">
            {heroData.title_main.split(heroData.title_highlight)[0]}
            <span className="highlight-gold">{heroData.title_highlight}</span>
            {heroData.title_main.split(heroData.title_highlight)[1]}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle fade-in-up">
            {heroData.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions fade-in-up">
            <button className="btn-primary btn-lg" onClick={() => navigate("/services")}>
              <span>Explore Services</span>
              <FiArrowRight size={20} />
            </button>
            <a
              href="https://wa.me/919337720521"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-lg"
            >
              <FaWhatsapp size={20} aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust fade-in">
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">
                <FaClock />
              </div>
              <div className="trust-number">{heroData.stat_years}+</div>
              <div className="trust-label">Years Experience</div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">
                <FaRegSmile />
              </div>
              <div className="trust-number">{heroData.stat_clients}+</div>
              <div className="trust-label">Happy Clients</div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">
                <FaMedal />
              </div>
              <div className="trust-number">{heroData.stat_services}+</div>
              <div className="trust-label">Premium Services</div>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <aside className="hero-visual" aria-label="Trending services">
          <div className="hero-service-panel">
            <div className="hero-service-panel-head">
              <div>
                <span className="hero-service-eyebrow">
                  <FiTrendingUp aria-hidden /> Trending
                </span>
                <h3>Most booked today</h3>
              </div>
              <span className="hero-service-live">
                <span className="hero-service-live-dot" aria-hidden />
                Live
              </span>
            </div>

            <div className="hero-service-list">
              {trendingServices.map((svc, idx) => (
                <article key={svc.id} className="hero-service-item" style={{ animationDelay: `${0.1 * idx}s` }}>
                  <span className="hero-service-rank">{idx + 1}</span>
                  <div className="hero-service-icon" aria-hidden>
                    <svc.Icon />
                  </div>
                  <div className="hero-service-info">
                    <strong>{svc.title}</strong>
                    <p>
                      <span className="hero-service-duration">{svc.duration}</span>
                      <span className="hero-service-badge">{svc.badge}</span>
                    </p>
                  </div>
                  <div className="hero-service-price">
                    <span className="hero-service-price-from">from</span>
                    <span className="hero-service-price-amount">₹{svc.price}</span>
                  </div>
                </article>
              ))}
            </div>

            <button className="hero-service-btn" onClick={() => navigate("/services")}>
              <span>Explore all services</span>
              <FiArrowRight size={18} aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
