import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import './Header.css';

/* Single-page site for now — no separate routes to link to, so the nav
   drawer (hamburger toggler + expanding menu panel) is switched off
   rather than deleted. Flip this back to true if multi-section nav
   links are needed again; all the markup/CSS/animation stays intact. */
const SHOW_NAV_DRAWER = false;

/* Search icon/panel hidden for now — same reasoning as the nav drawer,
   kept in place rather than deleted in case it's needed later. */
const SHOW_SEARCH = false;

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#products', label: 'Shop' },
  { href: '#contact', label: 'Contact' },
];

function AccountIcon() {
  const { isLoggedIn, user, checkingSession, openLogin } = useAuth();

  if (checkingSession) {
    return <span className="lumi-icon-btn lumi-account-placeholder" aria-hidden="true" />;
  }

  if (isLoggedIn) {
    return (
      <Link className="lumi-icon-btn lumi-account-avatar" to="/profile" aria-label="My account">
        <img
          src={`/assets/images/avatar/${user.image}`}
          alt=""
          width="32"
          height="32"
          onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
        />
      </Link>
    );
  }

  return (
    <button className="lumi-icon-btn" type="button" aria-label="Log in or register" onClick={openLogin}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
  );
}

function HeaderIcons({ searchOpen, onToggleSearch, onOpenCart }) {
  const { itemCount } = useCart();

  return (
    <div className="lumi-icons">
      <button
        className="lumi-icon-btn lumi-cart-btn"
        type="button"
        aria-label="Open cart"
        onClick={onOpenCart}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {itemCount > 0 && <span className="lumi-cart-badge">{itemCount}</span>}
      </button>
      <AccountIcon />
      {SHOW_SEARCH && (
        <button
          className="lumi-icon-btn"
          type="button"
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={onToggleSearch}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('#home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return undefined;

    const sectionIds = NAV_LINKS.map((l) => l.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (href) => {
    setMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSearch = () => setSearchOpen((o) => !o);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <header className={`lumi-header ${menuOpen ? 'is-open' : ''}`}>
      <nav className="lumi-navbar container">
        <a
          className="lumi-logo"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
        >
          <img src="/images/logo.webp" alt="Lumi9" width="140" height="54" fetchPriority="high" />
        </a>

        {SHOW_NAV_DRAWER && (
          <button
            className={`lumi-toggler ${menuOpen ? 'is-open' : ''}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="lumi-nav-menu"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="lumi-toggler-bar" />
            <span className="lumi-toggler-bar" />
          </button>
        )}

        {SHOW_NAV_DRAWER ? (
          /* Desktop-only inline nav/icons — hidden on mobile in favor of
             the expanding collapse panel below, which lives outside the
             nav bar so it can grow the header's own body. */
          <div className="lumi-nav-collapse lumi-nav-collapse-desktop">
            <ul className="lumi-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`lumi-nav-link ${activeHash === link.href ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <HeaderIcons searchOpen={searchOpen} onToggleSearch={toggleSearch} onOpenCart={openCart} />
          </div>
        ) : (
          /* Single-page mode — no drawer, icons sit directly in the bar
             at every screen size. */
          <div className="lumi-icons-bar">
            <HeaderIcons searchOpen={searchOpen} onToggleSearch={toggleSearch} onOpenCart={openCart} />
          </div>
        )}
      </nav>

      {SHOW_NAV_DRAWER && (
        /* Mobile expanding panel — part of the header's own normal flow,
           between the navbar and the wave, so growing it pushes the
           header's curved bottom edge down with it. */
        <div
          className={`lumi-nav-collapse lumi-nav-collapse-mobile ${menuOpen ? 'is-open' : ''}`}
          id="lumi-nav-menu"
        >
          <div className="lumi-nav-collapse-inner container">
            <ul className="lumi-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`lumi-nav-link ${activeHash === link.href ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <HeaderIcons searchOpen={searchOpen} onToggleSearch={toggleSearch} onOpenCart={openCart} />
          </div>
        </div>
      )}

      {SHOW_SEARCH && (
        <div className={`lumi-search-wrap ${searchOpen ? 'is-open' : ''}`}>
          <form className="lumi-search-form" role="search" onSubmit={(e) => e.preventDefault()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="lumi-search-input" type="search" name="q" placeholder="Search products..." autoComplete="off" />
            <button className="lumi-search-submit" type="submit" aria-label="Submit search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <div className="lumi-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            fill="var(--color-cream-50)"
            d="M0,60 L40,8 Q80,65 120,8 Q160,65 200,8 Q240,65 280,8 Q320,65 360,8 Q400,65 440,8 Q480,65 520,8 Q560,65 600,8 Q640,65 680,8 Q720,65 760,8 Q800,65 840,8 Q880,65 920,8 Q960,65 1000,8 Q1040,65 1080,8 Q1120,65 1160,8 Q1200,65 1240,8 Q1280,65 1320,8 Q1360,65 1400,8 L1440,60 Z"
          />
        </svg>
      </div>

      <CartDrawer open={cartOpen} onClose={closeCart} />
    </header>
  );
}
