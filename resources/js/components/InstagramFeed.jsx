import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import './InstagramFeed.css';

const STEP_INTERVAL = 2600; // ms between each step
const FALLBACK_PROFILE_URL = 'https://www.instagram.com/';

function VideoPost({ post }) {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="insta-card-media-wrap" ref={wrapRef}>
      {!ready && <span className="insta-card-skeleton" aria-hidden="true" />}
      {inView && (
        <video
          className={`insta-card-media${ready ? ' is-ready' : ''}`}
          src={post.videoUrl}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onLoadedData={() => setReady(true)}
        />
      )}
    </div>
  );
}

function PostMedia({ post }) {
  if (post.mediaType === 'VIDEO' && post.videoUrl) {
    return <VideoPost post={post} />;
  }

  return (
    <img
      className="insta-card-media"
      src={post.imageUrl || '/images/logo.webp'}
      alt={post.caption || 'Lumi9 on Instagram'}
      loading="lazy"
      onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
    />
  );
}

export default function InstagramFeed() {
  const gridRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [profileUrl, setProfileUrl] = useState(FALLBACK_PROFILE_URL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/instagram/feed')
      .then((data) => {
        setPosts(data.posts || []);
        setProfileUrl(data.profileUrl || FALLBACK_PROFILE_URL);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !posts.length) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    let timer = null;

    function step() {
      const card = grid.querySelector('.insta-card');
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || '0');
      const advance = cardWidth + gap;

      const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
      if (atEnd) {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        grid.scrollBy({ left: advance, behavior: 'smooth' });
      }
    }

    timer = setInterval(step, STEP_INTERVAL);

    // Pause the auto-step while the visitor is manually interacting.
    function pause() {
      clearInterval(timer);
    }
    function resume() {
      clearInterval(timer);
      timer = setInterval(step, STEP_INTERVAL);
    }

    grid.addEventListener('pointerdown', pause);
    grid.addEventListener('pointerup', resume);
    grid.addEventListener('pointercancel', resume);

    return () => {
      clearInterval(timer);
      grid.removeEventListener('pointerdown', pause);
      grid.removeEventListener('pointerup', resume);
      grid.removeEventListener('pointercancel', resume);
    };
  }, [posts]);

  if (!loading && !posts.length) return null;

  return (
    <section className="insta-section" aria-label="Instagram Moments">
      <div className="insta-inner">
        <div className="insta-header">
          <h2 className="insta-title">
            <img className="insta-flourish" src="/images/baby_paw-2.webp" alt="" aria-hidden="true" />
            <span className="insta-title-lines">
              <span className="insta-title-line">Some Things Don&rsquo;t Need Words,</span>
              <span className="insta-title-line">You Just Feel Them.</span>
            </span>
            <img className="insta-flourish" src="/images/baby_paw-2.webp" alt="" aria-hidden="true" />
          </h2>
          <p className="insta-subtitle">Let your baby&rsquo;s reaction say it all.</p>
        </div>

        {loading ? (
          <p className="insta-status">Loading moments…</p>
        ) : (
          <div className="insta-grid" ref={gridRef}>
            {posts.map((post) => (
              <a
                className="insta-card"
                key={post.id}
                href={post.permalink || profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="insta-badge" aria-hidden="true">
                  <img src="/images/baby_paw (2).webp" alt="" />
                </span>
                <div className="insta-card-img">
                  <PostMedia post={post} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
