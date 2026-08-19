import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <img
        className="hero-banner-img"
        src="/images/hero_banner_output1.webp"
        alt="Lumi9 — gentle care, every step of the way"
        fetchPriority="high"
        width="1672"
        height="770"
      />

      <div className="hero-text-overlay">
        <p className="hero-eyebrow">Lumi9 Diaper</p>
        <h1 className="hero-headline">
          Every Touch
          <span className="hero-ribbon-row">
            <span className="hero-ribbon">feels like</span>
          </span>
          <span className="hero-headline-accent">Love</span>
        </h1>
        <p className="hero-tagline">Gentle comfort. Happy moments.</p>
      </div>

      <img
        className="hero-diaper-gif"
        src="/images/diaper.gif"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
    </section>
  );
}
