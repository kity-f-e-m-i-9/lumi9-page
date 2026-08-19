import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useCart } from '../components/CartContext';
import './OrderConfirmPage.css';

const FAILURE_MESSAGES = {
  cancelled: 'Your payment was cancelled. No amount has been charged.',
  payment_failed: 'Your payment could not be completed. No amount has been charged.',
  expired: 'Your payment session expired. No amount has been charged.',
};

export default function OrderConfirmPage() {
  const [searchParams] = useSearchParams();
  const orderToken = searchParams.get('order_token');
  const navigate = useNavigate();
  const { refresh: refreshCart } = useCart();
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = () => {
    if (!orderToken) {
      navigate('/checkout?payment_error=' + encodeURIComponent('Missing order reference.'), { replace: true });
      return;
    }

    setLoading(true);
    apiFetch(`/api/checkout/confirm?order_token=${encodeURIComponent(orderToken)}`)
      .then(async (data) => {
        if (data.status === 'paid') {
          await refreshCart();
          const params = new URLSearchParams({ order: 'success' });
          if (data.orderId) params.set('id', data.orderId);
          if (data.totalAmount != null) params.set('amount', data.totalAmount);
          navigate(`/profile?${params.toString()}`, { replace: true });
          return;
        }

        if (data.status === 'pending') {
          setPending(true);
          setLoading(false);
          return;
        }

        const message = data.message || FAILURE_MESSAGES[data.status] || 'Payment was not completed.';
        navigate('/checkout?payment_error=' + encodeURIComponent(message), { replace: true });
      })
      .catch((err) => {
        const message = err.status === 401
          ? 'Your session expired. Please log in again to check your order status.'
          : err.message;
        navigate('/checkout?payment_error=' + encodeURIComponent(message), { replace: true });
      });
  };

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderToken]);

  if (pending) {
    return (
      <div className="order-confirm-page container">
        <div className="order-confirm-card">
          <div className="order-confirm-icon order-confirm-icon-pending">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>
          <h1 className="order-confirm-title">Payment processing</h1>
          <p className="order-confirm-text">
            We're still confirming your payment. This can take a moment — please check again shortly.
          </p>
          <div className="order-confirm-actions">
            <button type="button" className="btn btn-primary" onClick={checkStatus}>Check again</button>
            <Link to="/" className="order-confirm-link">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirm-page container">
      <div className="order-confirm-card">
        <p className="order-confirm-status">
          {loading ? 'Checking your payment status…' : 'Redirecting…'}
        </p>
      </div>
    </div>
  );
}
