import { useEffect, useState } from 'react';
import './Preloader.css';

/* Minimum time the preloader stays up even if the page loads instantly —
   avoids a jarring flash for fast connections while still disappearing
   quickly once assets are actually ready. */
const MIN_VISIBLE_MS = 900;

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const start = Date.now();

    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
      setTimeout(() => setLoaded(true), remaining);
    };

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
      return () => window.removeEventListener('load', finish);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!loaded) return undefined;
    const timeout = setTimeout(() => setHidden(true), 500);
    return () => clearTimeout(timeout);
  }, [loaded]);

  if (hidden) return null;

  return (
    <div className={`lumi-preloader ${loaded ? 'is-loaded' : ''}`} role="status" aria-label="Loading">
      <div className="lumi-preloader-mark">
        <div className="lumi-preloader-badge" />
        <img src="/images/logo.webp" alt="" aria-hidden="true" className="lumi-preloader-logo" />
        <div className="lumi-preloader-ring" />
      </div>

      <div className="lumi-preloader-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path
            fill="var(--color-green-600)"
            d="M0,60 L40,8 Q80,65 120,8 Q160,65 200,8 Q240,65 280,8 Q320,65 360,8 Q400,65 440,8 Q480,65 520,8 Q560,65 600,8 Q640,65 680,8 Q720,65 760,8 Q800,65 840,8 Q880,65 920,8 Q960,65 1000,8 Q1040,65 1080,8 Q1120,65 1160,8 Q1200,65 1240,8 Q1280,65 1320,8 Q1360,65 1400,8 L1440,60 Z"
          />
        </svg>
      </div>
    </div>
  );
}
