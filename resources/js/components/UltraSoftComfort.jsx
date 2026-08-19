import { useEffect, useRef } from 'react';
import './UltraSoftComfort.css';

const LIFE_CYCLE_CHARS = [
  { n: 2, mobileKeep: false },
  { n: 1, mobileKeep: true },
  { n: 3, mobileKeep: true },
  { n: 4, mobileKeep: false },
  { n: 5, mobileKeep: true },
  { n: 6, mobileKeep: false },
  { n: 8, mobileKeep: false },
  { n: 9, mobileKeep: true },
  { n: 10, mobileKeep: false },
  { n: 11, mobileKeep: true },
  { n: 14, mobileKeep: false },
  { n: 15, mobileKeep: true },
  { n: 12, mobileKeep: false },
  { n: 13, mobileKeep: true },
];

const CARDS = [
  {
    photo: '/images/split_baby_1.webp',
    title: 'Ultra Soft Comfort',
    desc: 'Cloud-soft feel for delicate baby skin.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 21c0-8.5 6-14 14-16-1.5 8-6 14-14 16z" />
        <path d="M5 21c1.2-4 3.8-7.4 7.2-9.8" />
      </svg>
    ),
  },
  {
    photo: '/images/split_baby_2.webp',
    photoKey: 'leakage',
    title: 'Leakage Protection',
    desc: 'Up to 12 hours of dryness.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    photo: '/images/split_baby_3.webp',
    title: 'Gentle & Safe',
    desc: 'Made with skin-friendly materials.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-6.7-4.35-9.3-8.2C.9 10 1.4 6.4 4.3 4.8c2.3-1.3 5-.6 6.7 1.4 1.7-2 4.4-2.7 6.7-1.4 2.9 1.6 3.4 5.2 1.6 8-2.6 3.85-9.3 8.2-9.3 8.2z" />
      </svg>
    ),
  },
  {
    photo: '/images/split_baby_4.webp',
    photoKey: 'eco',
    title: 'Eco Conscious',
    desc: 'Thoughtful for babies and the planet.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 19H4.5a2 2 0 01-1.73-3l1.7-2.94" />
        <path d="M11 19h7.5a2 2 0 001.73-3l-1.32-2.28" />
        <path d="M14 9.5L17.5 15" />
        <path d="M8 13.5L6.2 10.4 9.7 9" />
        <path d="M9.2 5.6L11.5 2l4 2.3-2.2 3.9" />
        <path d="M13.2 9.5H20" />
      </svg>
    ),
  },
];

export default function UltraSoftComfort() {
  const sectionRef = useRef(null);
  const charsRef = useRef(null);
  const cardsRowRef = useRef(null);
  const activeCardRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const charsContainer = charsRef.current;
    if (!section || !charsContainer) return undefined;

    let played = false;
    const STAGGER = 70; // ms between each character appearing

    function playOnce() {
      if (played) return;
      played = true;
      const chars = Array.prototype.slice.call(charsContainer.querySelectorAll('.cjw-char'));
      chars.forEach((el, i) => {
        setTimeout(() => el.classList.add('cjw-on'), i * STAGGER);
      });
      observer.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playOnce();
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  function goToCard(step) {
    const row = cardsRowRef.current;
    if (!row) return;
    const cards = Array.prototype.slice.call(row.querySelectorAll('.comfort-card'));
    if (!cards.length) return;
    const current = activeCardRef.current;
    const next = (current + step + cards.length) % cards.length;
    cards[current].classList.remove('cc-active');
    cards[next].classList.add('cc-active');
    activeCardRef.current = next;
  }

  return (
    <section className="comfort-section" aria-label="Ultra Soft Comfort" ref={sectionRef}>
      {/* TOP WAVE (300px tall) — cream fill gives room for characters above the wave curve */}
      <div className="comfort-top-wave">
        <svg viewBox="0 -180 1440 300" preserveAspectRatio="none">
          <path d="M0,-180 L1440,-180 L1440,28 C1440,28 1400,36 1360,30 C1220,8 1080,-5 900,18 C760,40 620,42 460,25 C320,10 180,5 0,35 Z" fill="#fdf6e7" />
          <path d="M0,35 C180,5 320,10 460,25 C620,42 760,40 900,18 C1080,-5 1220,8 1360,30 C1400,36 1440,28 1440,28" fill="none" stroke="#beaf81" strokeWidth="2.4" strokeLinecap="round" />
        </svg>

        <div className="cjw-chars" ref={charsRef}>
          {LIFE_CYCLE_CHARS.map(({ n, mobileKeep }, i) => (
            <img
              key={i}
              className={`cjw-char${mobileKeep ? ' cjw-mobile-keep' : ''}`}
              src={`/images/life-cycle-${n}-opt.webp`}
              alt=""
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* BABY IMAGE */}
      <div className="comfort-baby-abs">
        <img src="/images/baby-dark.webp" className="comfort-baby-img" alt="" loading="lazy" />
      </div>

      <div className="comfort-inner">
        <h2 className="comfort-heading">
          Ultra Soft
          <br />
          Comfort
        </h2>
        <p className="comfort-desc">
          From playful mornings to peaceful nights,
          <br />
          ensuring dryness, freedom of movement, and lasting comfort.
        </p>
        <div className="comfort-cards-row" ref={cardsRowRef}>
          {/* Hidden via CSS (.comfort-arrow{display:none}) — kept out of tab
              order and the accessibility tree so keyboard/screen-reader
              users don't land on inert, invisible controls. */}
          <button type="button" className="comfort-arrow comfort-arrow-prev" aria-label="Previous card" aria-hidden="true" tabIndex={-1} onClick={() => goToCard(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {CARDS.map((card, i) => (
            <div className={`comfort-card${i === 0 ? ' cc-active' : ''}`} key={card.title}>
              <div className="comfort-card-photo" style={{ background: '#fdf6e7' }}>
                <img
                  src={card.photo}
                  className="comfort-card-img"
                  data-photo={card.photoKey}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="comfort-card-content">
                <div className="cc-icon-title">
                  <div className="comfort-card-icon">{card.icon}</div>
                  <div className="comfort-card-title">{card.title}</div>
                </div>
                <div className="comfort-card-divider" />
                <div className="comfort-card-desc">{card.desc}</div>
              </div>
            </div>
          ))}

          <button type="button" className="comfort-arrow comfort-arrow-next" aria-label="Next card" aria-hidden="true" tabIndex={-1} onClick={() => goToCard(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* BOTTOM CURVE */}
      <div className="comfort-bottom-wave">
        <svg viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M0,195 C120,250 280,205 480,188 C700,170 920,125 1140,135 C1300,142 1390,162 1440,175 L1440,280 L0,280 Z" fill="#fdf6e7" stroke="none" />
          <path d="M0,195 C120,250 280,205 480,188 C700,170 920,125 1140,135 C1300,142 1390,162 1440,175" fill="none" stroke="#c8b87a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
