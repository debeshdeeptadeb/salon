import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { FaCrown, FaClock, FaGem, FaMedal, FaRegSmile, FaStar, FaWhatsapp } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import "./Hero.css";
import { homeContentAPI } from "../../services/api";

export default function Hero() {
  const [heroData, setHeroData] = useState({
    badge_text: "Bhubaneswar's Premier Luxury Salon",
    title_main: "Where Elegance Meets Expert Care",
    title_highlight: "Elegance",
    subtitle: "Experience world-class beauty and grooming services in an atmosphere of refined luxury. Your transformation begins here.",
    stat_years: 10,
    stat_clients: 5000,
    stat_services: 50
  });

  useEffect(() => {
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
  }, []);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-preview');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <button className="btn-primary btn-lg" onClick={scrollToServices}>
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
        <div className="hero-visual">
          <div className="hero-image-container">
            {/* Decorative Frame */}
            <div className="hero-frame">
              <div className="frame-corner frame-corner-tl"></div>
              <div className="frame-corner frame-corner-tr"></div>
              <div className="frame-corner frame-corner-bl"></div>
              <div className="frame-corner frame-corner-br"></div>
            </div>

            {/* Floating Elements */}
            <div className="floating-element floating-element-1">
              <div className="element-icon" aria-hidden="true">
                <FaGem />
              </div>
              <div className="element-text">Premium Quality</div>
            </div>
            <div className="floating-element floating-element-2">
              <div className="element-icon" aria-hidden="true">
                <FaStar />
              </div>
              <div className="element-text">Expert Stylists</div>
            </div>
            <div className="floating-element floating-element-3">
              <div className="element-icon" aria-hidden="true">
                <FaCrown />
              </div>
              <div className="element-text">Luxury Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
        <span className="scroll-text">Scroll to explore</span>
      </div>
    </section>
  );
}
