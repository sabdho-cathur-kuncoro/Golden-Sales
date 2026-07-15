// SMOKE: notification list route mounts + shows its header. The list service is
// mocked to resolve an empty page (network-free).
jest.mock('@/services/notification.services', () => ({
  __esModule: true,
  getNotifService: jest.fn(async () => ({ data: [] })),
  onReadAllNotifService: jest.fn(),
  onReadNotifService: jest.fn(),
}));

import { render, screen } from '@testing-library/react-native';
import Notifikasi from './index';

describe('Notifikasi list screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<Notifikasi />);
    expect(await screen.findByText('Notifikasi')).toBeTruthy();
  });
});
