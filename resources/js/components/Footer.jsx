import './Footer.css';

const FOOTER_COLUMNS = [
  {
    heading: 'About Us',
    links: [
      { label: 'Our Story', href: '#home' },
      { label: 'For Babies', href: '#products' },
      { label: 'For Women', href: 'https://femi9.in', external: true },
    ],
  },
  {
    heading: 'Information',
    links: [
      { label: 'Contact Us', href: '#contact' },
      { label: 'FAQ', href: 'https://femi9.in/faq', external: true },
      { label: 'Terms & Conditions', href: 'https://femi9.in/terms-and-conditions', external: true },
      { label: 'Privacy Policy', href: 'https://femi9.in/privacy-and-policy', external: true },
    ],
  },
];

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.02-1.36A10 10 0 1012 2zm0 18.2a8.16 8.16 0 01-4.17-1.14l-.3-.18-3.1.84.83-3.03-.2-.32A8.2 8.2 0 1112 20.2zm4.5-6.14c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="lumi-footer" id="contact" aria-label="Footer">
      <div className="lumi-footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path
            fill="var(--color-cream-100)"
            d="M0,35 C480,70 960,0 1440,35 L1440,70 L0,70 Z"
          />
          <path
            fill="none"
            stroke="var(--color-tan-300)"
            strokeWidth="2.4"
            strokeLinecap="round"
            d="M0,35 C480,70 960,0 1440,35"
          />
        </svg>

        <div className="footer-mascot-wrap">
          <img className="footer-mascot" src="/images/footer-mascot.webp" alt="" loading="lazy" />
        </div>
      </div>

      <div className="lumi-footer-inner">
        <div className="lumi-footer-grid">
          <div className="lumi-footer-brand">
            <img src="/images/footer-logo.webp" alt="Lumi9" className="footer-logo-img" />
            <p className="footer-logo-sub">Made with love, for your little one.</p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h6>{col.heading}</h6>
              {col.links.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          <div className="footer-col">
            <h6>Contact</h6>
            <a href="tel:+919042916499">
              <PhoneIcon />
              +91 90429 16499
            </a>
            <a href="mailto:support@femi9.in">
              <MailIcon />
              support@femi9.in
            </a>
            <a href="https://wa.me/919042916499" target="_blank" rel="noopener noreferrer">
              <WhatsappIcon />
              WhatsApp
            </a>
            <a href="https://www.instagram.com/lumi9official" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Lumi9. All rights reserved. Made with ♥ for little ones.
        </div>
      </div>
    </footer>
  );
}
