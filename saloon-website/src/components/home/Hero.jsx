import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
            <span className="badge-icon">✦</span>
            <span className="badge-text">{heroData.badge_text}</span>
            <span className="badge-icon">✦</span>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a
              href="https://wa.me/919337720521"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust fade-in">
            <div className="trust-item">
              <div className="trust-number">{heroData.stat_years}+</div>
              <div className="trust-label">Years Experience</div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-number">{heroData.stat_clients}+</div>
              <div className="trust-label">Happy Clients</div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
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
              <div className="element-icon">✦</div>
              <div className="element-text">Premium Quality</div>
            </div>
            <div className="floating-element floating-element-2">
              <div className="element-icon">★</div>
              <div className="element-text">Expert Stylists</div>
            </div>
            <div className="floating-element floating-element-3">
              <div className="element-icon">◆</div>
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
