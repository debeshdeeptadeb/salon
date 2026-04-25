import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./Navbar.css";
import defaultLogo from "../../assets/logo/minjal-salon-logo.svg";
import { settingsAPI, API_ORIGIN } from "../../services/api";
import NavbarSearch from "./NavbarSearch";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [logo, setLogo] = useState(defaultLogo);
  const [siteName, setSiteName] = useState('MINJAL');
  const [siteTagline, setSiteTagline] = useState('Luxury Salon');
  const WA_PHONE = "919337720521";
  const BOOKING_MESSAGE = "Hello Minjal Salon! I want to book an appointment. Please share available time slots. Thank you!";
  const WA_BOOK_LINK = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(BOOKING_MESSAGE)}`;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        const data = response.data.data;
        if (data.navbar_logo_url) {
          setLogo(data.navbar_logo_url.startsWith('http') ? data.navbar_logo_url : `${API_ORIGIN}${data.navbar_logo_url}`);
        }
        if (data.site_name) setSiteName(data.site_name);
        if (data.site_tagline) setSiteTagline(data.site_tagline);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Use default values
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) setIsMobileSearchOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">

        {/* LOGO */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src={logo} alt={siteName} />
          <span className="navbar-logo-text">
            <span className="logo-main">{siteName}</span>
            <span className="logo-sub">{siteTagline}</span>
          </span>
        </Link>

        {/* DESKTOP SEARCH BAR */}
        <NavbarSearch />

        {/* DESKTOP NAV LINKS */}
        <nav className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/catalogue" className="nav-link">Catalogue</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* CTA BUTTONS */}
        <div className="navbar-cta">
          <Link to="/admin/login" className="navbar-admin-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Admin
          </Link>
          <a
            href={WA_BOOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary navbar-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Book Now
          </a>
        </div>

        {/* MOBILE SEARCH ICON */}
        <button
          className="nsearch-mobile-toggle"
          onClick={toggleMobileSearch}
          aria-label="Search salons"
        >
          <FaMagnifyingGlass />
        </button>

        {/* MOBILE MENU TOGGLE */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* MOBILE SEARCH BAR */}
      <NavbarSearch className={`mobile-search-bar${isMobileSearchOpen ? ' active' : ''}`} />

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <nav className="mobile-menu-links">
          <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to="/services" className="mobile-nav-link" onClick={closeMobileMenu}>
            Services
          </Link>
          <Link to="/catalogue" className="mobile-nav-link" onClick={closeMobileMenu}>
            Catalogue
          </Link>
          <Link to="/gallery" className="mobile-nav-link" onClick={closeMobileMenu}>
            Gallery
          </Link>
          <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
            About
          </Link>
          <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
            Contact
          </Link>
          <Link to="/admin/login" className="mobile-nav-link" onClick={closeMobileMenu}>
            Admin Portal
          </Link>
        </nav>
        <div className="mobile-menu-cta">
          <a
            href={WA_BOOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            onClick={closeMobileMenu}
          >
            Book Appointment
          </a>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </header>
  );
}
