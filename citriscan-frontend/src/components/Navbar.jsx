import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Use Cases', href: '/#use-cases' },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      if (location.pathname !== '/') {
        window.location.href = href;
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-nav">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="nav-logo">
          <span className="navbar__logo-icon">🍋</span>
          <span className="navbar__logo-text">CitriScan</span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links" id="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="navbar__link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="navbar__actions" id="nav-actions">
          <Link to="/login" className="navbar__btn navbar__btn--ghost" id="nav-login-btn">
            Log In
          </Link>
          <Link to="/signup" className="navbar__btn navbar__btn--primary" id="nav-signup-btn">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`} id="mobile-menu">
        <ul className="navbar__mobile-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="navbar__mobile-link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-actions">
          <Link to="/login" className="navbar__btn navbar__btn--ghost navbar__btn--full">
            Log In
          </Link>
          <Link to="/signup" className="navbar__btn navbar__btn--primary navbar__btn--full">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
