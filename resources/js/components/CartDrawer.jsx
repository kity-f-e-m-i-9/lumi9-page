import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './CartDrawer.css';

const productImageSrc = (image) => (image ? `/uploads/Product/${image}` : '/images/logo.webp');

export default function CartDrawer({ open, onClose }) {
  const { items, subtotal, itemCount, setQty, removeItem } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.qty, 0);
  const savings = mrpTotal - subtotal;

  return (
    <>
      <div
        className={`cart-overlay ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`cart-drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <header className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Your Cart
            {itemCount > 0 && <span className="cart-drawer-count">{itemCount}</span>}
          </h2>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="cart-drawer-wave" aria-hidden="true">
          <svg viewBox="0 0 400 16" preserveAspectRatio="none">
            <path
              d="M0,4 C40,16 80,-4 120,4 C160,12 200,-4 240,4 C280,12 320,-4 360,4 C380,8 390,2 400,4 L400,16 L0,16 Z"
              fill="var(--color-cream-50)"
            />
          </svg>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="cart-empty-title">Your cart is empty</p>
            <p className="cart-empty-text">Add some gentle care for your little one.</p>
            <button type="button" className="btn btn-primary cart-empty-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => (
                <li className="cart-item" key={item.variantId}>
                  <div className="cart-item-image">
                    <img
                      src={productImageSrc(item.image)}
                      alt={item.name}
                      loading="lazy"
                      width="72"
                      height="72"
                      onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
                    />
                  </div>

                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-variant">{item.label}</p>

                    <div className="cart-item-footer">
                      <div className="cart-item-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => setQty(item.variantId, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.variantId, item.qty + 1)}
                          aria-label="Increase quantity"
                          disabled={item.qty >= item.stock}
                          title={item.qty >= item.stock ? 'No more stock available' : undefined}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price">
                        <span className="cart-item-price-current">₹{item.price * item.qty}</span>
                        {item.mrp > item.price && (
                          <span className="cart-item-price-mrp">₹{item.mrp * item.qty}</span>
                        )}
                      </div>
                    </div>

                    {item.qty >= item.stock && (
                      <p className="cart-item-stock-note">Only {item.stock} in stock</p>
                    )}
                  </div>


                  <button
                    type="button"
                    className="cart-item-remove"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.variantId)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="cart-drawer-footer">
              {savings > 0 && (
                <p className="cart-savings">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                  </svg>
                  You're saving ₹{savings} on this order
                </p>
              )}

              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <span className="cart-subtotal-amount">₹{subtotal}</span>
              </div>

              <button type="button" className="btn btn-primary cart-checkout-btn" onClick={goToCheckout}>
                Checkout · ₹{subtotal}
              </button>
              <button type="button" className="cart-continue-btn" onClick={onClose}>
                Continue Shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
