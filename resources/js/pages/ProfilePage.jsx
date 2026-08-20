import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { formatAmount } from '../lib/currency';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';
import './ProfilePage.css';

const productImageSrc = (image) => (image ? `/uploads/Product/${image}` : '/images/logo.webp');

function maskedMobile(mobile) {
  if (!mobile || mobile.length < 4) return mobile || '';
  return mobile.slice(-4);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatJoinDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function HeroCard({ user, totalOrders, onLogout }) {
  return (
    <div className="ph-hero-card">
      <div className="ph-hero-backdrop" aria-hidden="true">
        <svg className="ph-hero-leaf ph-hero-leaf-1" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 19.41L5.71 20l1-2.3A4.49 4.49 0 008 18c7 0 10-7.5 9-10z" /></svg>
        <svg className="ph-hero-leaf ph-hero-leaf-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 19.41L5.71 20l1-2.3A4.49 4.49 0 008 18c7 0 10-7.5 9-10z" /></svg>
      </div>

      <div className="ph-hero-body">
        <div className="ph-hero-avatar-wrap">
          <img
            src={`/assets/images/avatar/${user.image}`}
            alt=""
            className="ph-hero-avatar"
            onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
          />
        </div>

        <h1 className="ph-hero-name">{user.name}</h1>
        <p className="ph-hero-tagline">
          {formatJoinDate(user.created_at) ? `Member since ${formatJoinDate(user.created_at)}` : 'Welcome back to Lumi9'}
        </p>

        <div className="ph-hero-stats">
          <div className="ph-hero-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
            <span>₹{formatAmount(user.wallet ?? 0)} wallet</span>
          </div>
          <span className="ph-hero-stat-divider" aria-hidden="true" />
          <div className="ph-hero-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>
            <span>{totalOrders ?? '—'} {totalOrders === 1 ? 'order' : 'orders'}</span>
          </div>
          <span className="ph-hero-stat-divider" aria-hidden="true" />
          <div className="ph-hero-stat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
            <span>{user.mobile}</span>
          </div>
        </div>

        <button type="button" className="ph-hero-cta" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  const firstName = (user.name || '').split(' ')[0] || user.name;
  const referralCode = `${window.location.origin}?referral_id=lumi9${user.id}`;
  const toast = useToast();

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success('Referral link copied to clipboard.');
    } catch {
      toast.error('Could not copy the link. Please copy it manually.');
    }
  };

  return (
    <>
      <div className="ph-card">
        <h2 className="ph-card-title">Profile Settings</h2>
        <div className="ph-field-grid">
          <label className="ph-field">
            <span>Name</span>
            <input type="text" value={user.name || ''} disabled />
          </label>
          <label className="ph-field">
            <span>Phone</span>
            <input type="text" value={user.mobile || ''} disabled />
          </label>
          <label className="ph-field ph-field-wide">
            <span>Email</span>
            <input type="text" value={user.email || ''} disabled />
          </label>
          <label className="ph-field">
            <span>Birthday</span>
            <input type="date" value={user.dob_date || ''} disabled />
          </label>
          <label className="ph-field">
            <span>Anniversary</span>
            <input type="date" value={user.anniversary_date || ''} disabled />
          </label>
        </div>
        <p className="ph-field-note">Profile editing is coming soon.</p>
      </div>

      <div className="ph-hero-card ph-wallet-hero">
        <div className="ph-hero-backdrop" aria-hidden="true" />
        <div className="ph-hero-body ph-wallet-body">
          <div className="ph-wallet-top">
            <span className="ph-wallet-brand">Lumi9 Wallet</span>
            <span className="ph-wallet-chip" aria-hidden="true" />
          </div>
          <p className="ph-wallet-number">**** **** **** {maskedMobile(user.mobile)}</p>
          <div className="ph-wallet-bottom">
            <div>
              <span>Card Holder</span>
              <strong>{firstName}</strong>
            </div>
            <div>
              <span>Balance</span>
              <strong>₹{formatAmount(user.wallet ?? 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="ph-card">
        <h2 className="ph-card-title">Referral Program</h2>
        <p className="ph-referral-text">Share your referral link and earn rewards for every purchase your friends make!</p>
        <p className="ph-referral-label">Your Referral Code</p>
        <div className="ph-referral-row">
          <span className="ph-referral-code">{referralCode}</span>
          <button type="button" className="ph-hero-cta ph-referral-btn" onClick={copyReferral}>
            Copy Code
          </button>
        </div>
      </div>
    </>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalOrders, setTotalOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const toast = useToast();

  useEffect(() => {
    apiFetch('/api/orders?page=0')
      .then((data) => {
        setOrders(data.orders || []);
        setHasMore(!!data.hasMore);
        setTotalOrders(data.totalOrders ?? 0);
        setPage(0);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await apiFetch(`/api/orders?page=${nextPage}`);
      setOrders((prev) => [...prev, ...(data.orders || [])]);
      setHasMore(!!data.hasMore);
      setPage(nextPage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <p className="ph-status">Loading your orders…</p>;
  }

  if (totalOrders === 0) {
    return (
      <div className="ph-card ph-orders-empty">
        <div className="ph-orders-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </div>
        <h2 className="ph-card-title">No orders yet</h2>
        <p className="ph-field-note">Your order history will show up here once you place your first order.</p>
        <Link to="/" className="ph-hero-cta">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="ph-orders-list">
      {orders.map((order) => (
        <Link to={`/profile/orders/${order.id}`} className="ph-order-card" key={order.id}>
          <div className="ph-order-thumb-wrap">
            <img
              src={productImageSrc(order.firstItemImage)}
              alt=""
              className="ph-order-thumb"
              onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
            />
          </div>
          <div className="ph-order-info">
            <p className="ph-order-title">
              Order #{order.id}
              {order.itemCount > 1 ? ` · ${order.itemCount} items` : ''}
            </p>
            <p className="ph-order-meta">{formatDate(order.placedAt)}</p>
          </div>
          <span className={`ph-order-status${order.paid ? ' is-paid' : ''}`}>
            {order.paid ? 'Paid' : 'Pending'}
          </span>
          <span className="ph-order-total">₹{formatAmount(order.total)}</span>
          <svg className="ph-order-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ))}

      {hasMore && (
        <button type="button" className="ph-orders-load-more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading…' : 'Load More'}
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, checkingSession, isLoggedIn, openLogin, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('order') === 'success' ? 'orders' : 'profile');
  const [totalOrders, setTotalOrders] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const orderSuccess = searchParams.get('order') === 'success';
  const orderId = searchParams.get('id');
  const orderAmount = searchParams.get('amount');

  useEffect(() => {
    if (!isLoggedIn) return;
    apiFetch('/api/orders?page=0')
      .then((data) => setTotalOrders(data.totalOrders ?? 0))
      .catch(() => setTotalOrders(null));
  }, [isLoggedIn]);

  const dismissOrderBanner = () => {
    searchParams.delete('order');
    searchParams.delete('id');
    searchParams.delete('amount');
    setSearchParams(searchParams, { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  if (checkingSession) {
    return <div className="profile-page container"><p className="ph-status">Loading…</p></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="profile-page container">
        <div className="ph-card ph-loggedout">
          <h1 className="ph-card-title">Log in to view your profile</h1>
          <p className="ph-field-note">Please log in to see your account details and orders.</p>
          <button type="button" className="btn btn-primary" onClick={openLogin}>
            Log in / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page container">
      <HeroCard user={user} totalOrders={totalOrders} onLogout={handleLogout} />

      {orderSuccess && (
        <div className="ph-order-success" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            Order placed successfully{orderId ? ` — #${orderId}` : ''}{orderAmount ? ` · ₹${formatAmount(orderAmount)}` : ''}.
            Thank you for shopping with Lumi9!
          </span>
          <button type="button" onClick={dismissOrderBanner} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="ph-tabs" role="tablist" aria-label="Account sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`ph-tab${activeTab === 'profile' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          className={`ph-tab${activeTab === 'orders' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      <div className="ph-tab-content">
        {activeTab === 'profile' ? <ProfileTab user={user} /> : <OrdersTab />}
      </div>
    </div>
  );
}
