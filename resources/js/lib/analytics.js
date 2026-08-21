import { apiFetch } from './api';

/**
 * Reports one real page view to the backend analytics pipeline
 * (App\Http\Controllers\AnalyticsController::pageview). This is what
 * creates/updates the visitor + session rows that order-conversion
 * tracking later attributes checkout completions to — without it,
 * analytics_visitors/sessions/page_views/order_conversions all stay empty.
 *
 * Failures are swallowed: analytics must never break navigation.
 */
export function trackPageView(url) {
  const payload = {
    url,
    referrer: document.referrer || null,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };

  apiFetch('/api/analytics/pageview', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).catch(() => {
    // Analytics is best-effort; never surface this to the user.
  });
}
