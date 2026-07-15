import { render, screen, fireEvent } from '@testing-library/react-native';

import TileNotif from './TileNotif';

// NOTE (harness gap): SVGs imported via `@/assets/*.svg` bypass the global
// svgMock because moduleNameMapper's `^@/assets/(.*)$` rule matches before the
// `\.svg$` rule, resolving to the real asset file. TileNotif doesn't import any
// (uses FontAwesome6 / lucide), so no local svg mock is needed here.

// Recursively test whether any rendered node carries a style matching `pred`.
// Used to detect the small unread dot (a text-less View) — a purely visual
// state that has no user-visible copy to assert on.
function hasStyleMatching(node: any, pred: (s: any) => boolean): boolean {
  if (!node || typeof node !== 'object') return false;
  const nodes = Array.isArray(node) ? node : [node];
  for (const n of nodes) {
    if (!n) continue;
    const styles = [].concat(n.props?.style ?? []).flat().filter(Boolean);
    if (styles.some(pred)) return true;
    if (n.children && hasStyleMatching(n.children, pred)) return true;
  }
  return false;
}

const isUnreadDot = (s: any) => s.width === 8 && s.height === 8;

describe('TileNotif', () => {
  it('renders the title and an explicit body', async () => {
    await render(
      <TileNotif data={{ title: 'Pesanan disetujui', body: 'Detail pesanan Anda', createdAt: '2026-07-14T10:00:00Z' }} />
    );
    expect(screen.getByText('Pesanan disetujui')).toBeTruthy();
    expect(screen.getByText('Detail pesanan Anda')).toBeTruthy();
  });

  it('renders the unread dot when unread', async () => {
    const r = await render(
      <TileNotif data={{ title: 'Baru', body: 'x', status: 'unread', createdAt: '2026-07-14T10:00:00Z' }} />
    );
    expect(hasStyleMatching(r.toJSON(), isUnreadDot)).toBe(true);
  });

  it('hides the unread dot when read', async () => {
    const r = await render(
      <TileNotif data={{ title: 'Lama', body: 'x', status: 'read', createdAt: '2026-07-14T10:00:00Z' }} />
    );
    expect(hasStyleMatching(r.toJSON(), isUnreadDot)).toBe(false);
  });

  it('builds the default approval body from sales_name and order_id when no body', async () => {
    await render(
      <TileNotif
        data={{ title: 'Approval', sales_name: 'Budi', order_id: 'ORD-9', createdAt: '2026-07-14T10:00:00Z' }}
      />
    );
    expect(screen.getByText('Budi')).toBeTruthy();
    expect(screen.getByText('ORD-9')).toBeTruthy();
  });

  it('renders the delivery body for delivery-type notifications', async () => {
    await render(
      <TileNotif data={{ title: 'Kirim', type: 'delivery', order_id: 'ORD-7', createdAt: '2026-07-14T10:00:00Z' }} />
    );
    expect(screen.getByText('ORD-7')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(
      <TileNotif data={{ title: 'Tap', body: 'x', createdAt: '2026-07-14T10:00:00Z' }} onPress={onPress} />
    );
    fireEvent.press(await screen.findByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
