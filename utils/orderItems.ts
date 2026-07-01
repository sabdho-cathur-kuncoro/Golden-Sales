// Group order items by (productName + unitPrice). When multiple rows fall into
// the same group (e.g. Kartu Perdana with 1 row per SN / phone number), the
// group is flagged `isGrouped` so the UI can render an accordion.
//
// Field-name tolerant: backend may send `categoryName` or `category`, and the
// serial/secret code as `productCode`, `sn`, or `serialNumber`. Subtotal is
// computed from unitPrice/quantity/discount when not provided.

const num = (v: any) => Number(v) || 0;

export const itemCategory = (item: any): string | null =>
  item?.categoryName ?? item?.category ?? null;

export const itemCode = (item: any): string | null =>
  item?.productCode ?? item?.sn ?? item?.serialNumber ?? null;

export const itemUnitPrice = (item: any): number => num(item?.unitPrice) ?? 0;

export const itemSubtotal = (item: any): number =>
  item?.subtotal != null
    ? num(item.subtotal)
    : num(item?.unitPrice) * num(item?.quantity) - num(item?.discount);

export function groupOrderItems(items: any[]) {
  const map = new Map<string, any>();
  for (const item of items || []) {
    const key = `${item?.productName}__${item?.unitPrice}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        productName: item?.productName,
        unitPrice: num(item?.unitPrice),
        rows: [],
      });
    }
    map.get(key).rows.push(item);
  }
  return Array.from(map.values()).map((g) => ({
    ...g,
    categoryName: itemCategory(g.rows[0]),
    totalQuantity: g.rows.reduce(
      (s: number, r: any) => s + num(r?.quantity),
      0
    ),
    totalSubtotal: g.rows.reduce((s: number, r: any) => s + itemSubtotal(r), 0),
    totalDiscount: g.rows.reduce(
      (s: number, r: any) => s + num(r?.discount),
      0
    ),
    isGrouped: g.rows.length > 1,
  }));
}

// Voucher category = secret code hidden until order Selesai.
export function isVoucherCategory(categoryName: string | null): boolean {
  if (!categoryName) return false;
  const lc = String(categoryName).toLowerCase();
  return lc.includes("voucer") || lc.includes("voucher");
}
