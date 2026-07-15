import { render, screen } from '@testing-library/react-native';
import RincianRequestProduct from './rincian';

describe('RincianRequestProduct screen (smoke)', () => {
  it('mounts and shows the product section', async () => {
    await render(<RincianRequestProduct />);
    // "Rincian Permintaan" appears twice (header + section), so anchor on a
    // unique heading instead.
    expect(screen.getByText('Produk Order')).toBeTruthy();
  });
});
