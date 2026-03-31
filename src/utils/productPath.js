/**
 * URL segment for /product/:segment — prefer slug when set, else numeric id (backward compatible).
 */
export function getProductPathSegment(product) {
  if (!product) return "";
  const slug = product.slug;
  if (slug != null && String(slug).trim() !== "") {
    return String(slug).trim();
  }
  return product.id != null ? String(product.id) : "";
}
