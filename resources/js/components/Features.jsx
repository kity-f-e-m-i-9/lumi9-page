import { useEffect, useRef } from 'react';
import './Features.css';

const FEATURES = [
  {
    label: 'Cloud-Soft Comfort',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 19a4.5 4.5 0 0 1-1.1-8.86 5 5 0 0 1 9.5-3.14 4.5 4.5 0 0 1 5.6 5.5A4 4 0 0 1 19.5 19h-13Z" />
      </svg>
    ),
  },
  {
    label: 'Up to 12hrs Absorption',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5c3.5 4.2 6.5 8.36 6.5 11.9a6.5 6.5 0 1 1-13 0c0-3.54 3-7.7 6.5-11.9Z" />
      </svg>
    ),
  },
  {
    label: 'Leakage Protection',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5 4.5 5.6v5.4c0 5 3.2 8.9 7.5 10.5 4.3-1.6 7.5-5.5 7.5-10.5V5.6L12 2.5Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </svg>
    ),
  },
  {
    label: 'Breathable & Airy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 8.5h11a2.75 2.75 0 1 0-2.6-3.7" />
        <path d="M2.5 12.5h15a2.75 2.75 0 1 1-2.6 3.7" />
        <path d="M2.5 16.5h8.5a2.25 2.25 0 1 1-2.1 3" />
      </svg>
    ),
  },
  {
    label: 'Eco Friendly Materials',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 20c9 0 14-5 14-14 0-.4 0-.7-.05-1C10.5 5.3 5 10 5 19c0 .34.02.67.05 1Z" />
        <path d="M5 20c1-4 4-7.5 9-10" />
      </svg>
    ),
  },
];

export default function Features() {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let resumeTimeout;

    const step = () => {
      if (!pausedRef.current) {
        const loopPoint = track.scrollWidth / 2;
        if (loopPoint > track.clientWidth) {
          track.scrollLeft += 0.6;
          if (track.scrollLeft >= loopPoint) {
            track.scrollLeft -= loopPoint;
          }
        }
      }
    };

    const intervalId = setInterval(step, 20);

    const pause = () => {
      pausedRef.current = true;
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        pausedRef.current = false;
      }, 3000);
    };

    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('wheel', pause, { passive: true });
    track.addEventListener('pointerdown', pause);

    return () => {
      clearInterval(intervalId);
      clearTimeout(resumeTimeout);
      track.removeEventListener('touchstart', pause);
      track.removeEventListener('wheel', pause);
      track.removeEventListener('pointerdown', pause);
    };
  }, []);

  const loopFeatures = [...FEATURES, ...FEATURES];

  return (
    <section className="features-section" aria-label="Product highlights">
      <div className="features-wave features-wave-top" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C240,8 480,8 720,30 C960,52 1200,52 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>

      <div className="features-inner" ref={trackRef}>
        {loopFeatures.map((feature, index) => (
          <div className="feat-item" key={`${feature.label}-${index}`}>
            <div className="feat-icon-wrap">{feature.icon}</div>
            <p className="feat-label">{feature.label}</p>
          </div>
        ))}
      </div>

      <div className="features-wave features-wave-bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C240,52 480,52 720,30 C960,8 1200,8 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
