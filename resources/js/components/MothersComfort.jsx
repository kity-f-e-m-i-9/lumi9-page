import './MothersComfort.css';

const LEFT_FEATURES = [
  {
    title: 'Cloud Soft',
    text: 'Feels like a gentle cuddle.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
      </svg>
    ),
  },
  {
    title: 'Quick Absorption',
    text: 'Locks wetness away in seconds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    title: 'Overnight Comfort',
    text: 'Comfort that lasts till morning.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r=".5" fill="#fff" />
      </svg>
    ),
  },
];

const RIGHT_FEATURES = [
  {
    title: 'Snug and Secure Fit',
    text: 'Stays comfortably in place.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
      </svg>
    ),
  },
  {
    title: 'Breathable Design',
    text: 'Keeps baby skin fresh and protected.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Flexible Fit',
    text: 'Moves with every kick and crawl.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
];

function FeatureList({ items, columnClass }) {
  return (
    <div className={`mc-feature-group ${columnClass}`}>
      {items.map((item) => (
        <div className="mc-feature" key={item.title}>
          <div className="mc-feature-icon">{item.icon}</div>
          <div className="mc-feature-text">
            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MothersComfort() {
  return (
    <section className="mc-section" aria-label="Why Babies Love Lumi">
      <div className="mc-deco" aria-hidden="true">
        <svg style={{ top: '8%', left: '2%', width: 38, height: 38 }} viewBox="0 0 24 24" fill="none" stroke="#8aa74b" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <svg style={{ top: '45%', left: '1%', width: 44, height: 44 }} viewBox="0 0 24 24" fill="none" stroke="#8aa74b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <svg style={{ bottom: '14%', left: '6%', width: 32, height: 32 }} viewBox="0 0 24 24" fill="none" stroke="#8aa74b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <svg style={{ top: '7%', right: '2%', width: 34, height: 34 }} viewBox="0 0 24 24" fill="none" stroke="#8aa74b" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <svg style={{ bottom: '16%', right: '5%', width: 28, height: 28 }} viewBox="0 0 24 24" fill="none" stroke="#8aa74b" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </div>

      <div className="mc-inner">
        <h2 className="mc-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#8aa74b">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.41L5.71 20l1-2.3A4.49 4.49 0 008 18c7 0 10-7.5 9-10z" />
            <path d="M10.66 6.56c-.16-.6-.58-1.06-1.16-1.24a2 2 0 00-2.5 1.95c0 1.1.9 2 2 2a2 2 0 001.95-2.5c-.05-.07-.16-.14-.29-.21z" opacity=".4" />
          </svg>
          <span className="mc-title-text">A Mother's Comfort, In Every Diaper</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#8aa74b" style={{ transform: 'scaleX(-1)' }}>
            <path d="M17 8C8 10 5.9 16.17 3.82 19.41L5.71 20l1-2.3A4.49 4.49 0 008 18c7 0 10-7.5 9-10z" />
            <path d="M10.66 6.56c-.16-.6-.58-1.06-1.16-1.24a2 2 0 00-2.5 1.95c0 1.1.9 2 2 2a2 2 0 001.95-2.5c-.05-.07-.16-.14-.29-.21z" opacity=".4" />
          </svg>
        </h2>

        <div className="mc-row">
          <div className="mc-col mc-mascot-col">
            <div className="mc-mascot">
              <img src="/images/mother-comfort-mascot.webp" alt="Lumi mascot" loading="lazy" />
            </div>
          </div>

          <FeatureList items={LEFT_FEATURES} columnClass="mc-left-col" />

          <div className="mc-col mc-center-col">
            <div className="mc-circle-wrap">
              <div className="mc-baby-circle-outer">
                <div className="mc-baby-circle" />
                <img src="/images/mother-comfort-baby.webp" alt="Baby wearing a Lumi diaper" className="mc-baby-front" loading="lazy" />
              </div>
            </div>
          </div>

          <FeatureList items={RIGHT_FEATURES} columnClass="mc-right-col" />

          <div className="mc-col mc-sleeping-col">
            <div className="mc-sleeping">
              <img src="/images/mother-comfort-sleeping.webp" alt="Sleeping baby" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
