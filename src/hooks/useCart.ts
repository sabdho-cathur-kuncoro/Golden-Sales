import {
  lineInfo as lineInfoSelector,
  selectCartCount,
  selectNetSubtotal,
  selectPromoTotal,
  selectSubtotal,
  useCartStore,
} from "@/stores/cart.store";

/**
 * Cart hook — the consumer-facing wrapper the store docstring refers to
 * ("Consume via `useCart`"). Delegates to the existing `useCartStore` actions
 * (preserving `buildLine`'s `salesPrice` shape + cart-cache sync) and exposes
 * the shared selectors so screens don't touch the raw store.
 */
const useCart = () => {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const setQty = useCartStore((s) => s.setQty);
  const addSerial = useCartStore((s) => s.addSerial);
  const remove = useCartStore((s) => s.remove);
  const removeSerial = useCartStore((s) => s.removeSerial);
  const clearAll = useCartStore((s) => s.clearAll);
  const refresh = useCartStore((s) => s.refresh);
  const warehouse = useCartStore((s) => s.warehouse);

  const subtotal = useCartStore(selectSubtotal);
  const promoTotal = useCartStore(selectPromoTotal);
  const netSubtotal = useCartStore(selectNetSubtotal);
  const totalItems = useCartStore(selectCartCount);

  return {
    items,
    hydrated,
    setQty,
    addSerial,
    remove,
    removeSerial,
    clear: clearAll,
    refresh,
    warehouse,
    subtotal,
    promoTotal,
    netSubtotal,
    totalItems,
    lineInfo: lineInfoSelector,
  };
};

export default useCart;
