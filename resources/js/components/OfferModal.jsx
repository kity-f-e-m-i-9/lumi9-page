import { useEffect, useState } from 'react';
import './OfferModal.css';

const STORAGE_KEY = 'offerModalShowCount';
const MAX_SHOWS = 10;
const SHOW_DELAY_MS = 1500;

export default function OfferModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (shown >= MAX_SHOWS) return undefined;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, String(shown + 1));
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);

  const shopNow = () => {
    close();
    const target = document.querySelector('#products');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="offer-overlay" onClick={close} aria-hidden="true" />
      <div className="offer-modal-wrap">
        <div className="offer-modal" role="dialog" aria-modal="true" aria-label="Launch offer — 10% off">
          <button type="button" className="offer-modal-close" aria-label="Close" onClick={close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <img className="offer-modal-gif" src="/images/launch-offer-10percent.gif" alt="Lumi9 launch offer — 10% off" />

          <div className="offer-modal-body">
            <h2 className="offer-modal-title">Get 10% Off</h2>
            <p className="offer-modal-text">
              We're celebrating our launch! Enjoy 10% off on Lumi9 diapers — gentle care for your little one.
            </p>
            <button type="button" className="btn btn-primary offer-modal-cta" onClick={shopNow}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
