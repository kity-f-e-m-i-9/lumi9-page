export const SIZE_META = {
  NB: { name: 'Newborn', weight: '0 - 5 kg' },
  S: { name: 'Small', weight: '3 - 8 kg' },
  M: { name: 'Medium', weight: '7 - 12 kg' },
  L: { name: 'Large', weight: '9 - 14 kg' },
  XL: { name: 'Extra Large', weight: '12 - 17 kg' },
};

export const discountPercent = (price, mrp) => (mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);

export const productImageSrc = (image) => (image ? `/uploads/Product/${image}` : '/images/logo.webp');

export function parseLabel(label) {
  const match = /^([A-Za-z]+)\((\d+)\)$/.exec(label || '');
  return match ? { size: match[1], pack: match[2] } : { size: label || '', pack: '' };
}

export function toCard(product) {
  const variant = product.variants?.[0];
  if (!variant) return null;

  const { size, pack } = parseLabel(variant.label);
  const price = Number(variant.price) - Number(variant.discount || 0);
  const mrp = Number(variant.price);

  return {
    productId: product.id,
    variantId: variant.id,
    size,
    pack,
    name: SIZE_META[size]?.name ? `${SIZE_META[size].name} · ${pack} pcs` : product.name,
    weight: SIZE_META[size]?.weight || '',
    image: product.image,
    price,
    mrp,
    stock: variant.quantity,
  };
}
