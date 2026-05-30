/**
 * Client-side line pricing aligned with backend resolveCartLineUnitPrice + cart display.
 */

export function isMultiModelProduct(product) {
  return Array.isArray(product?.availableModels) && product.availableModels.length > 0;
}

export function getDefaultUnitPrice(product) {
  if (!product) return 0;
  const discRaw = product.discountPrice;
  const hasDisc = discRaw != null && discRaw !== "";
  const disc = hasDisc ? parseFloat(discRaw) : NaN;
  const base = parseFloat(product.price);
  if (hasDisc && Number.isFinite(disc)) return disc;
  return Number.isFinite(base) ? base : 0;
}

export function getUnitPriceForLine(product, selectedModelId) {
  let unit = getDefaultUnitPrice(product);
  if (!isMultiModelProduct(product)) return unit;

  const sid =
    selectedModelId != null && selectedModelId !== ""
      ? parseInt(String(selectedModelId), 10)
      : NaN;
  if (!Number.isFinite(sid)) return unit;

  const row = product.availableModels.find(
    (m) => Number(m.modelId) === sid
  );
  if (row?.priceOverride != null && row.priceOverride !== "") {
    const o = parseFloat(row.priceOverride);
    if (Number.isFinite(o)) unit = o;
  }
  return unit;
}

export function getSelectedModelLabel(product, selectedModelId) {
  if (!isMultiModelProduct(product)) return null;
  const sid =
    selectedModelId != null && selectedModelId !== ""
      ? parseInt(String(selectedModelId), 10)
      : NaN;
  if (!Number.isFinite(sid)) return null;
  const row = product.availableModels.find(
    (m) => Number(m.modelId) === sid
  );
  if (!row) return null;
  const b = row.brand?.name || "";
  const m = row.model?.name || "";
  const label = `${b} ${m}`.trim();
  return label || null;
}

export function cartLineKey(item) {
  const sid = item?.selectedModelId ?? "";
  return `${item?.id ?? "x"}-${sid}`;
}
