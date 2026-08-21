/**
 * Pushes ecommerce/auth events into GTM's dataLayer (container GTM-MQVWP47G,
 * see resources/views/app.blade.php) so GA4 tags reading {{DL - ...}}
 * variables can pick them up — mirrors the pattern already used on
 * Femi9's GTM container (GA4 - All Events tag: event_name from
 * DL - Event, page_type/page_category/method/user_id/value/
 * transaction_id from matching DL - * variables, currency fixed to INR).
 *
 * Every push clears the previous ecommerce object first (the standard GA4/GTM
 * recommendation) so line items from an earlier event don't leak into the
 * next one's report.
 */

function push(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object
  window.dataLayer.push(payload);
}

/**
 * Shared item-array shape for GA4 ecommerce events.
 * `product` may be a cart-summary line item ({productId, variantId, name,
 * price, qty}) or a product card ({productId, variantId, name, price}).
 */
function toItem(product, quantity = 1) {
  return {
    item_id: String(product.variantId ?? product.productId ?? ''),
    item_name: product.name ?? '',
    price: Number(product.price ?? 0),
    quantity: Number(quantity),
  };
}

export function trackAddToCart(product, quantity = 1) {
  const item = toItem(product, quantity);
  push({
    event: 'add_to_cart',
    value: Number((item.price * item.quantity).toFixed(2)),
    currency: 'INR',
    ecommerce: { items: [item] },
  });
}

export function trackSignup(user, method = 'whatsapp') {
  push({
    event: 'sign_up',
    method,
    user_id: user?.id != null ? String(user.id) : undefined,
  });
}

export function trackLogin(user, method = 'whatsapp') {
  push({
    event: 'login',
    method,
    user_id: user?.id != null ? String(user.id) : undefined,
  });
}

export function trackBeginCheckout(items, total) {
  push({
    event: 'begin_checkout',
    value: Number(total ?? 0),
    currency: 'INR',
    ecommerce: {
      value: Number(total ?? 0),
      currency: 'INR',
      items: (items || []).map((item) => toItem(item, item.qty ?? 1)),
    },
  });
}

/**
 * Fires when the user clicks "Place Order" and is about to be redirected to
 * the payment page — the actual proceed-to-checkout moment, distinct from
 * begin_checkout (which fires when the checkout page's summary first loads).
 */
export function trackCheckoutProgress(items, total) {
  push({
    event: 'checkout_progress',
    value: Number(total ?? 0),
    currency: 'INR',
    ecommerce: {
      value: Number(total ?? 0),
      currency: 'INR',
      items: (items || []).map((item) => toItem(item, item.qty ?? 1)),
    },
  });
}

export function trackPurchase({ orderId, value, items }) {
  push({
    event: 'purchase',
    transaction_id: orderId != null ? String(orderId) : undefined,
    value: Number(value ?? 0),
    currency: 'INR',
    ecommerce: {
      transaction_id: orderId != null ? String(orderId) : undefined,
      value: Number(value ?? 0),
      currency: 'INR',
      items: (items || []).map((item) => toItem(item, item.qty ?? 1)),
    },
  });
}
