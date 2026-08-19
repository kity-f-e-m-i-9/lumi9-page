import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import './OrderDetailPage.css';

const productImageSrc = (image) => (image ? `/uploads/Product/${image}` : '/images/logo.webp');

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    apiFetch(`/api/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="order-detail-page container"><p className="order-detail-status">Loading order…</p></div>;
  }

  if (notFound || !order) {
    return (
      <div className="order-detail-page container">
        <div className="order-detail-empty">
          <h1 className="order-detail-title">Order not found</h1>
          <p className="order-detail-text">We couldn't find this order, or it doesn't belong to your account.</p>
          <Link to="/profile" className="btn btn-primary">Back to orders</Link>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="order-detail-page container">
      <Link to="/profile" className="order-detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to orders
      </Link>

      <div className="order-detail-header">
        <div>
          <h1 className="order-detail-title">Order #{order.id}</h1>
          <p className="order-detail-meta">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <span className={`order-detail-status-badge${order.paid ? ' is-paid' : ''}`}>
          {order.paid ? 'Paid' : 'Payment pending'}
        </span>
      </div>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <div className="order-detail-card">
            <h2 className="order-detail-card-title">Items</h2>
            <ul className="order-detail-items">
              {order.items.map((item, i) => (
                <li className="order-detail-item" key={item.variantId ?? i}>
                  <img
                    src={productImageSrc(item.image)}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
                  />
                  <div className="order-detail-item-info">
                    <p className="order-detail-item-name">{item.name}</p>
                    <p className="order-detail-item-variant">{item.label} · Qty {item.qty}</p>
                  </div>
                  <span className="order-detail-item-total">₹{item.lineTotal ?? item.price * item.qty}</span>
                </li>
              ))}
            </ul>
          </div>

          {order.tracking && (
            <div className="order-detail-card">
              <h2 className="order-detail-card-title">Tracking</h2>
              <p className="order-detail-tracking">
                <strong>{order.tracking.carrierCode}</strong> · {order.tracking.trackingId}
              </p>
            </div>
          )}

          <div className="order-detail-card">
            <h2 className="order-detail-card-title">Shipping address</h2>
            <p className="order-detail-address">
              {addr.fname} {addr.lname}<br />
              {addr.address}{addr.optional_name ? `, ${addr.optional_name}` : ''}<br />
              {addr.city}, {addr.state} {addr.pin_code}<br />
              {addr.mobile_num}
            </p>
          </div>
        </div>

        <aside className="order-detail-summary">
          <h2 className="order-detail-card-title">Order Summary</h2>
          <div className="order-detail-totals">
            <div className="order-detail-totals-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="order-detail-totals-row">
              <span>Delivery</span>
              <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'Free'}</span>
            </div>
            {order.coupon && (
              <div className="order-detail-totals-row order-detail-totals-discount">
                <span>Coupon ({order.coupon})</span>
                <span>−₹{order.couponDiscount}</span>
              </div>
            )}
            {order.walletUsed > 0 && (
              <div className="order-detail-totals-row order-detail-totals-discount">
                <span>Wallet redeemed</span>
                <span>−₹{order.walletUsed}</span>
              </div>
            )}
            <div className="order-detail-totals-row order-detail-totals-grand">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
