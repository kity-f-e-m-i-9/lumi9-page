import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { formatAmount } from '../lib/currency';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';
import { trackBeginCheckout, trackCheckoutProgress } from '../lib/dataLayer';
import './CheckoutPage.css';

const productImageSrc = (image) => (image ? `/uploads/Product/${image}` : '/images/logo.webp');

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'New Delhi', 'Odisha (Orissa)', 'Pondicherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const EMPTY_ADDRESS_FORM = {
  first_name: '',
  last_name: '',
  address: '',
  optional_name: '',
  city: '',
  state: '',
  country: 'India',
  pin_code: '',
  mobile_num: '',
  ship_email: '',
};

function AddressForm({ initial, onSaved, onCancel, showCancel }) {
  const [form, setForm] = useState(initial || EMPTY_ADDRESS_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: null }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const data = await apiFetch('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onSaved(data.address_id);
    } catch (err) {
      if (err.errors) {
        const flat = {};
        Object.entries(err.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(flat);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="checkout-address-form" onSubmit={submit} noValidate>
      <div className="checkout-form-row">
        <label className="checkout-field">
          <span>First name</span>
          <input type="text" value={form.first_name} onChange={update('first_name')} required />
          {errors.first_name && <p className="checkout-field-error">{errors.first_name}</p>}
        </label>
        <label className="checkout-field">
          <span>Last name</span>
          <input type="text" value={form.last_name} onChange={update('last_name')} />
          {errors.last_name && <p className="checkout-field-error">{errors.last_name}</p>}
        </label>
      </div>

      <label className="checkout-field">
        <span>Address</span>
        <input type="text" value={form.address} onChange={update('address')} placeholder="House no., street, area" required />
        {errors.address && <p className="checkout-field-error">{errors.address}</p>}
      </label>

      <label className="checkout-field">
        <span>Landmark (optional)</span>
        <input type="text" value={form.optional_name} onChange={update('optional_name')} />
      </label>

      <div className="checkout-form-row">
        <label className="checkout-field">
          <span>City</span>
          <input type="text" value={form.city} onChange={update('city')} required />
          {errors.city && <p className="checkout-field-error">{errors.city}</p>}
        </label>
        <label className="checkout-field">
          <span>State</span>
          <select value={form.state} onChange={update('state')} required>
            <option value="" disabled>Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="checkout-field-error">{errors.state}</p>}
        </label>
      </div>

      <div className="checkout-form-row">
        <label className="checkout-field">
          <span>PIN code</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={form.pin_code}
            onChange={(e) => update('pin_code')({ target: { value: e.target.value.replace(/\D/g, '') } })}
            required
          />
          {errors.pin_code && <p className="checkout-field-error">{errors.pin_code}</p>}
        </label>
        <label className="checkout-field">
          <span>Country</span>
          <input type="text" value={form.country} onChange={update('country')} required />
          {errors.country && <p className="checkout-field-error">{errors.country}</p>}
        </label>
      </div>

      <div className="checkout-form-row">
        <label className="checkout-field">
          <span>Mobile number</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.mobile_num}
            onChange={(e) => update('mobile_num')({ target: { value: e.target.value.replace(/\D/g, '') } })}
            required
          />
          {errors.mobile_num && <p className="checkout-field-error">{errors.mobile_num}</p>}
        </label>
        <label className="checkout-field">
          <span>Email</span>
          <input type="email" value={form.ship_email} onChange={update('ship_email')} required />
          {errors.ship_email && <p className="checkout-field-error">{errors.ship_email}</p>}
        </label>
      </div>

      <div className="checkout-form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save address'}
        </button>
        {showCancel && (
          <button type="button" className="checkout-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function AddressSection({ addressId, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadAddresses = () => {
    setLoading(true);
    apiFetch('/api/addresses')
      .then((data) => {
        const list = data.addresses || [];
        setAddresses(list);
        if (!addressId && list.length) {
          const primary = list.find((a) => a.primary_addrs) || list[0];
          onSelect(primary.id);
        }
        setAdding(list.length === 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = (newId) => {
    setAdding(false);
    onSelect(newId);
    loadAddresses();
  };

  if (loading) {
    return <p className="checkout-status">Loading addresses…</p>;
  }

  return (
    <div className="checkout-section">
      <h2 className="checkout-section-title">Shipping address</h2>

      {addresses.length > 0 && (
        <div className="checkout-address-list" role="radiogroup" aria-label="Choose shipping address">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`checkout-address-card${addressId === addr.id ? ' is-selected' : ''}`}
            >
              <input
                type="radio"
                name="address"
                checked={addressId === addr.id}
                onChange={() => onSelect(addr.id)}
              />
              <span className="checkout-address-card-body">
                <strong>{addr.fname} {addr.lname}</strong>
                <span>{addr.address}{addr.optional_name ? `, ${addr.optional_name}` : ''}</span>
                <span>{addr.city}, {addr.state} {addr.pin_code}</span>
                <span>{addr.mobile_num}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      {!adding && addresses.length > 0 && (
        <button type="button" className="checkout-add-address-btn" onClick={() => setAdding(true)}>
          + Add a new address
        </button>
      )}

      {adding && (
        <AddressForm
          onSaved={handleSaved}
          onCancel={() => setAdding(false)}
          showCancel={addresses.length > 0}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { isLoggedIn, checkingSession, openLogin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addressId, setAddressId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [walletTaken, setWalletTaken] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState(searchParams.get('payment_error'));
  const toast = useToast();
  const beganCheckoutRef = useRef(false);

  const dismissPaymentError = () => {
    setPaymentError(null);
    searchParams.delete('payment_error');
    setSearchParams(searchParams, { replace: true });
  };

  const loadSummary = () => {
    setSummaryLoading(true);
    setSummaryError(null);

    const params = new URLSearchParams();
    if (addressId) params.set('addr_id', addressId);
    if (walletTaken) params.set('wallet_taken', '1');

    apiFetch(`/api/checkout/summary?${params.toString()}`)
      .then((data) => {
        setSummary(data);
        if (!beganCheckoutRef.current && data?.items?.length) {
          beganCheckoutRef.current = true;
          trackBeginCheckout(data.items, data.total);
        }
      })
      .catch((err) => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, addressId, walletTaken]);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const data = await apiFetch('/api/coupon/apply', {
        method: 'POST',
        body: JSON.stringify({ coupon: couponInput.trim() }),
      });
      if (!data.success) {
        setCouponError(data.message || 'Invalid coupon');
        return;
      }
      toast.success(`Coupon "${data.coupon.name}" applied.`);
      setCouponInput('');
      loadSummary();
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await apiFetch('/api/coupon/remove', { method: 'POST' });
      loadSummary();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const placeOrder = async () => {
    setPlacingOrder(true);
    try {
      if (summary) {
        trackCheckoutProgress(summary.items, summary.total);
        // OrderConfirmPage can't refetch line items after payment returns
        // from femi9.in, so stash them here for the purchase event.
        try {
          window.sessionStorage.setItem(
            'lumi9_pending_purchase_items',
            JSON.stringify(summary.items || [])
          );
        } catch {
          // sessionStorage unavailable (private mode etc.) — purchase event
          // will just fire without line items.
        }
      }

      const data = await apiFetch('/api/checkout/place-order', {
        method: 'POST',
        body: JSON.stringify({ addr_id: addressId, wallet_taken: walletTaken ? 1 : 0 }),
      });
      window.location.href = data.redirectUrl;
    } catch (err) {
      if (err.payload?.stockIssues?.length) {
        setSummary((s) => (s ? { ...s, stockIssues: err.payload.stockIssues } : s));
      }
      toast.error(err.message);
      setPlacingOrder(false);
    }
  };

  if (checkingSession) {
    return <div className="checkout-page container"><p className="checkout-status">Loading…</p></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout-page container">
        <div className="checkout-empty">
          <p className="checkout-empty-title">Log in to checkout</p>
          <p className="checkout-empty-text">Please log in or create an account to continue to checkout.</p>
          <button type="button" className="btn btn-primary" onClick={openLogin}>
            Log in / Register
          </button>
        </div>
      </div>
    );
  }

  if (!summaryLoading && summaryError) {
    return (
      <div className="checkout-page container">
        {paymentError && (
          <div className="checkout-payment-error" role="alert">
            <span>{paymentError}</span>
            <button type="button" onClick={dismissPaymentError} aria-label="Dismiss">×</button>
          </div>
        )}
        <div className="checkout-empty">
          <p className="checkout-empty-title">Your cart is empty</p>
          <p className="checkout-empty-text">Add some products before checking out.</p>
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <h1 className="checkout-title">Checkout</h1>

      {paymentError && (
        <div className="checkout-payment-error" role="alert">
          <span>{paymentError}</span>
          <button type="button" onClick={dismissPaymentError} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-main">
          <AddressSection addressId={addressId} onSelect={setAddressId} />
        </div>

        <aside className="checkout-summary">
          <h2 className="checkout-section-title">Order Summary</h2>

          {summaryLoading || !summary ? (
            <p className="checkout-status">Loading order summary…</p>
          ) : (
            <>
              {summary.stockIssues?.length > 0 && (
                <div className="checkout-stock-warning">
                  {summary.stockIssues.map((issue, i) => <p key={i}>{issue}</p>)}
                </div>
              )}
              <ul className="checkout-items">
                {summary.items.map((item) => (
                  <li className="checkout-item" key={item.variantId}>
                    <img
                      src={productImageSrc(item.image)}
                      alt={item.name}
                      width="56"
                      height="56"
                      onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
                    />
                    <div className="checkout-item-details">
                      <p className="checkout-item-name">{item.name}</p>
                      <p className="checkout-item-variant">{item.label} · Qty {item.qty}</p>
                    </div>
                    <span className="checkout-item-total">₹{formatAmount(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <form className="checkout-coupon-form" onSubmit={applyCoupon}>
            {summary?.coupon ? (
              <div className="checkout-coupon-applied">
                <span>Coupon <strong>{summary.coupon.code}</strong> applied</span>
                <button type="button" onClick={removeCoupon} aria-label="Remove coupon">×</button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                />
                <button type="submit" className="btn btn-outline" disabled={couponBusy}>
                  {couponBusy ? 'Applying…' : 'Apply'}
                </button>
              </>
            )}
          </form>
          {couponError && <p className="checkout-field-error">{couponError}</p>}

          {summary && summary.walletBalance > 0 && (
            <label className="checkout-wallet-toggle">
              <input
                type="checkbox"
                checked={walletTaken}
                onChange={(e) => setWalletTaken(e.target.checked)}
              />
              Use wallet balance (₹{formatAmount(summary.walletBalance)} available)
            </label>
          )}

          {summary && (
            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span>Subtotal</span>
                <span>₹{formatAmount(summary.subtotal)}</span>
              </div>
              <div className="checkout-totals-row">
                <span>Delivery</span>
                <span>{summary.deliveryFee > 0 ? `₹${formatAmount(summary.deliveryFee)}` : 'Free'}</span>
              </div>
              {summary.coupon && (
                <div className="checkout-totals-row checkout-totals-discount">
                  <span>Coupon discount</span>
                  <span>−₹{formatAmount(summary.coupon.discount)}</span>
                </div>
              )}
              {summary.walletAmount > 0 && (
                <div className="checkout-totals-row checkout-totals-discount">
                  <span>Wallet redeemed</span>
                  <span>−₹{formatAmount(summary.walletAmount)}</span>
                </div>
              )}
              <div className="checkout-totals-row checkout-totals-grand">
                <span>Total</span>
                <span>₹{formatAmount(summary.total)}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary checkout-place-order-btn"
            disabled={!addressId || !summary || placingOrder}
            onClick={placeOrder}
          >
            {placingOrder ? 'Placing order…' : `Place Order · ₹${formatAmount(summary?.total ?? 0)}`}
          </button>
          {!addressId && <p className="checkout-status">Add a shipping address to continue.</p>}
        </aside>
      </div>
    </div>
  );
}
