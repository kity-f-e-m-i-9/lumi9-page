import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { apiFetch } from '../lib/api';
import { discountPercent, parseLabel, productImageSrc, SIZE_META } from '../lib/products';
import { formatAmount } from '../lib/currency';
import { useCart } from '../components/CartContext';
import { useToast } from '../components/ToastContext';
import './ProductDetailPage.css';

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

function Breadcrumb({ name }) {
  return (
    <div className="pd-breadcrumb-band">
      <div className="container pd-breadcrumb-inner">
        <h1 className="pd-breadcrumb-title">Shop</h1>
        <p className="pd-breadcrumb-trail">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/#products">Shop</Link>
          {name && (
            <>
              <span>/</span>
              <span>{name}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    apiFetch('/api/products/diapers')
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(
    () => products?.find((p) => String(p.id) === String(id)) || null,
    [products, id]
  );

  const variant = product?.variants?.[0];

  const gallery = useMemo(() => {
    if (!product) return [];
    return ['image', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6']
      .map((key) => product[key])
      .filter(Boolean);
  }, [product]);

  useEffect(() => {
    setActiveIndex(0);
    setQty(1);
    setActiveTab('description');
  }, [gallery]);

  if (loading) {
    return (
      <div className="pd-page">
        <Breadcrumb />
        <div className="container"><p className="pd-status">Loading product…</p></div>
      </div>
    );
  }

  if (!product || !variant) {
    return (
      <div className="pd-page">
        <Breadcrumb />
        <div className="container">
          <div className="pd-empty">
            <h1 className="pd-empty-title">Product not found</h1>
            <p className="pd-empty-text">This product may no longer be available.</p>
            <Link to="/#products" className="btn btn-primary">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  const { size, pack } = parseLabel(variant.label);
  const price = Math.round((Number(variant.price) - Number(variant.discount || 0)) * 100) / 100;
  const mrp = Math.round(Number(variant.price) * 100) / 100;
  const stock = variant.quantity;
  const outOfStock = stock <= 0;
  const hasDiscount = mrp > price;
  const displayName = SIZE_META[size]?.name ? `${SIZE_META[size].name} · ${pack} pcs` : product.name;
  const excerpt = product.description ? stripHtml(product.description).slice(0, 160).trim() : '';

  const goPrev = () => setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % gallery.length);

  const handleAddToCart = async () => {
    setAdding(true);
    const ok = await addToCart(variant.id, qty);
    setAdding(false);
    if (ok) toast.success(`${displayName} added to cart.`);
  };

  return (
    <div className="pd-page">
      <Breadcrumb name={displayName} />

      <div className="container pd-body">
        <div className="pd-layout">
          <div className="pd-gallery">
            <div className="pd-main-panel">
              {gallery.length > 1 && (
                <>
                  <button type="button" className="pd-nav pd-nav-prev" onClick={goPrev} aria-label="Previous image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button type="button" className="pd-nav pd-nav-next" onClick={goNext} aria-label="Next image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
              <img
                src={productImageSrc(gallery[activeIndex])}
                alt={displayName}
                onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    className={`pd-thumb${activeIndex === i ? ' is-active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                    aria-label="View image"
                  >
                    <img
                      src={productImageSrc(img)}
                      alt=""
                      onError={(e) => { e.currentTarget.src = '/images/logo.webp'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <p className="pd-eyebrow">Lumi9 Diapers</p>

            <div className="pd-name-row">
              <h2 className="pd-name">{displayName}</h2>
              {outOfStock ? (
                <span className="pd-stock-pill pd-stock-pill-out">Sold out</span>
              ) : (
                <span className="pd-stock-pill">In Stock</span>
              )}
            </div>

            {SIZE_META[size]?.weight && (
              <p className="pd-fit-text">Fits {SIZE_META[size].weight}</p>
            )}

            <div className="pd-price-row">
              <span className="pd-price">₹{formatAmount(price)}</span>
              {hasDiscount && (
                <>
                  <span className="pd-mrp">₹{formatAmount(mrp)}</span>
                  <span className="pd-discount">{discountPercent(price, mrp)}% off</span>
                </>
              )}
            </div>

            {excerpt && <p className="pd-excerpt">{excerpt}…</p>}

            {size && (
              <div className="pd-size-group">
                <span className="pd-size-label">Size</span>
                <span className="pd-size-pill is-active">{size}</span>
              </div>
            )}

            {!outOfStock && (
              <div className="pd-buy-row">
                <div className="pd-stepper">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    aria-label="Increase quantity"
                    disabled={qty >= stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary pd-add-btn"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? 'Adding…' : `Add to Cart · ₹${formatAmount(price * qty)}`}
                </button>
              </div>
            )}

            <dl className="pd-meta-list">
              <div>
                <dt>SKU</dt>
                <dd>{product.sku_name || `LUMI9-${variant.id}`}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Baby Diapers</dd>
              </div>
            </dl>

            <div className="pd-share-row">
              <span>Share</span>
              <button
                type="button"
                aria-label="Copy product link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Product link copied to clipboard.');
                  } catch {
                    toast.error('Could not copy the link.');
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {(product.description || product.how_to_use) && (
          <div className="pd-tabs-block">
            <div className="pd-tabs" role="tablist">
              {product.description && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'description'}
                  className={`pd-tab${activeTab === 'description' ? ' is-active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
              )}
              {product.how_to_use && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'how_to_use'}
                  className={`pd-tab${activeTab === 'how_to_use' ? ' is-active' : ''}`}
                  onClick={() => setActiveTab('how_to_use')}
                >
                  How to Use
                </button>
              )}
            </div>

            <div className="pd-tab-panel">
              {activeTab === 'description' && product.description && (
                <div
                  className="pd-rich-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              )}
              {activeTab === 'how_to_use' && product.how_to_use && (
                <div
                  className="pd-rich-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.how_to_use) }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
