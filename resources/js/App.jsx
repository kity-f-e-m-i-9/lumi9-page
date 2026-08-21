import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import { trackPageView } from './lib/analytics';

/**
 * Order confirmation/success/detail views carry order_token, order id, and
 * amount in the URL. They're never useful as landing-page/traffic analytics
 * and shouldn't be stored as page views. Order-conversion attribution is
 * unaffected — that's recorded separately by CheckoutController from the
 * visitor's existing session, not from these page-view rows.
 */
function isOrderRelatedPath(pathname, search) {
  if (pathname === '/order/confirmation') {
    return true;
  }

  if (/^\/profile\/orders\//.test(pathname)) {
    return true;
  }

  if (pathname === '/profile' && new URLSearchParams(search).has('order')) {
    return true;
  }

  return false;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (isOrderRelatedPath(location.pathname, location.search)) {
      return;
    }

    trackPageView(window.location.href);
  }, [location.pathname, location.search]);

  return (
    <>
      <Preloader />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/confirmation" element={<OrderConfirmPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </>
  );
}
