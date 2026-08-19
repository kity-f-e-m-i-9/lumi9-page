import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { discountPercent, productImageSrc, toCard } from '../lib/products';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import './Collection.css';

export default function Collection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSize, setActiveSize] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/products/diapers')
      .then((data) => {
        if (cancelled) return;
        const cards = (data.products || []).map(toCard).filter(Boolean);
        setProducts(cards);
        if (cards.length) {
          const firstSize = cards.find((c) => c.size)?.size;
          setActiveSize(firstSize || null);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sizes = useMemo(() => {
    const seen = new Set();
    const order = ['NB', 'S', 'M', 'L', 'XL'];
    products.forEach((p) => p.size && seen.add(p.size));
    return order.filter((s) => seen.has(s));
  }, [products]);

  const visibleProducts = useMemo(
    () => products.filter((p) => p.size === activeSize),
    [products, activeSize]
  );

  const handleAddToCart = async (card) => {
    setAddingId(card.variantId);
    const ok = await addToCart(card.variantId, 1);
    setAddingId(null);
    if (ok) {
      toast.success(`${card.name} added to cart.`);
    }
  };

  return (
    <section className="collection-section" id="products" aria-label="Our Collection">
      <div className="collection-inner">
        <div className="collection-header">
          <p className="collection-eyebrow">Our Collection</p>
          <h2 className="collection-title">Crafted for little ones</h2>
          <p className="collection-subtitle">Gentle on skin. Strong where it matters.</p>
        </div>

        {sizes.length > 1 && (
          <div className="collection-size-tabs" role="tablist" aria-label="Diaper sizes">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                role="tab"
                aria-selected={activeSize === size}
                className={`collection-size-tab${activeSize === size ? ' is-active' : ''}`}
                onClick={() => setActiveSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="collection-status">Loading products…</p>}
        {!loading && !products.length && (
          <p className="collection-status">Products are unavailable right now. Please check back soon.</p>
        )}

        {!loading && !!visibleProducts.length && (
          <div className="product-grid">
            {visibleProducts.map((card) => {
              const outOfStock = card.stock <= 0;
              return (
                <article
                  key={card.variantId}
                  className={`product-card${outOfStock ? ' product-card-disabled' : ''}`}
                >
                  <div className="product-card-top">
                    <span className="product-card-code">{card.size}</span>
                    <svg className="product-card-leaf" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 8C8 10 5.9 16.17 3.82 19.41L5.71 20l1-2.3A4.49 4.49 0 008 18c7 0 10-7.5 9-10z" />
                    </svg>
                  </div>

                  <div className="product-card-panel">
                    <img
                      src={productImageSrc(card.image)}
                      alt={card.name}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
                    />
                  </div>

                  <div className="product-card-heading">
                    <h3 className="product-card-name">{card.name}</h3>
                    <span className="product-card-weight">{card.weight}</span>
                  </div>

                  <div className="product-card-price-row">
                    <span className="product-card-price">₹{card.price}</span>
                    {card.mrp > card.price && (
                      <>
                        <span className="product-card-mrp">₹{card.mrp}</span>
                        <span className="product-card-discount">{discountPercent(card.price, card.mrp)}% off</span>
                      </>
                    )}
                  </div>

                  {outOfStock ? (
                    <p className="product-card-oos">Sold out</p>
                  ) : (
                    <div className="product-card-actions">
                      <Link to={`/product/${card.productId}`} className="product-card-details">
                        See Details
                      </Link>
                      <button
                        type="button"
                        className="product-card-cart"
                        onClick={() => handleAddToCart(card)}
                        disabled={addingId === card.variantId}
                        aria-label={`Add ${card.name} to cart`}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
