import './Testimonials.css';

const AVATAR_COLORS = [
  '#8aa74b', // green-400
  '#c98a6b', // clay
  '#c06b8a', // rose
  '#4a8a8f', // teal
  '#c06b8a',
  '#6d8fc9',
  '#c9946b',
  '#6d7e2d', // green-500
  '#8f6dc9',
  '#4f9e6b',
];

const TESTIMONIALS = [
  {
    name: 'Aarthi K.',
    quote: 'Tried a few brands before. Lumi9 fits well and doesn’t feel bulky.',
  },
  {
    name: 'Lakshmi T.',
    quote: 'Finally found a diaper that keeps my baby happy and active.',
  },
  {
    name: 'Anitha R.',
    quote: 'As a mom, comfort matters most. Lumi9 gives my baby exactly that.',
  },
  {
    name: 'Deepika V.',
    quote: 'My baby smiles more, sleeps better, and stays comfortable longer.',
  },
  {
    name: 'Meera S.',
    quote: 'No leaks even through the night. This is the one my baby loves.',
  },
  {
    name: 'Sharmila N.',
    quote: 'Perfect for active little movers.',
  },
  {
    name: 'Harini V.',
    quote: 'My baby’s skin is quite sensitive. Lumi9 has been gentle and rash-free for us.',
  },
  {
    name: 'Pavithra N.',
    quote: 'As a first-time mom, finding the right diaper was stressful. Lumi9 made it easy.',
  },
  {
    name: 'Janani R.',
    quote: 'The diaper stays put even when my baby is crawling everywhere.',
  },
  {
    name: 'Kavya M.',
    quote: 'Soft, breathable, and it actually holds up all day. Highly recommend.',
  },
];

function initialsOf(name) {
  return name.trim().charAt(0).toUpperCase();
}

function TestimonialCard({ item, index }) {
  return (
    <article className="testi-card">
      <div className="testi-card-top">
        <span
          className="testi-avatar"
          style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          aria-hidden="true"
        >
          {initialsOf(item.name)}
        </span>
        <div className="testi-top-text">
          <div className="testi-stars" aria-label="5 out of 5 stars">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <div className="testi-name">{item.name}</div>
        </div>
      </div>
      <p className="testi-quote">{item.quote}</p>
      <div className="testi-verified">
        <span className="testi-verified-dot" aria-hidden="true" />
        Verified Buyer
      </div>
    </article>
  );
}

function MarqueeRow({ items, reverse, offset }) {
  // Duplicate the row content so the CSS animation loop is seamless.
  const looped = [...items, ...items];
  return (
    <div className={`testi-row${reverse ? ' testi-row-reverse' : ''}`} style={offset ? { '--testi-offset': offset } : undefined}>
      <div className="testi-track">
        {looped.map((item, i) => (
          <TestimonialCard item={item} index={i} key={`${item.name}-${i}`} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const rowA = TESTIMONIALS.slice(0, 5);
  const rowB = TESTIMONIALS.slice(5, 10);

  return (
    <section className="testimonials-section" aria-label="Customer Testimonials">
      <div className="testimonials-inner">
        <div className="testimonials-frame">
          <div className="testimonials-header">
            <h2 className="testimonials-title">Loved by Parents, Trusted by Experts</h2>
            <p className="testimonials-subtitle">Real stories from real parents</p>
          </div>

          <div className="testimonials-rows" role="list" aria-label="Parent testimonials">
            <MarqueeRow items={rowA} />
            <MarqueeRow items={rowB} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
