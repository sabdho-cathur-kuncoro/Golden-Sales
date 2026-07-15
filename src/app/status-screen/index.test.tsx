// Smoke: StatusPage route wrapper. Override useLocalSearchParams locally to feed
// the title/message/action params the screen reads.
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useLocalSearchParams: () => ({
      type: 'success',
      title: 'Pesanan Berhasil Dibuat!',
      message: 'Pesanan Anda sedang diproses.',
      primaryActionType: 'go-home',
      primaryActionTitle: 'Kembali ke Home',
    }),
  };
});

import { render, screen } from '@testing-library/react-native';
import StatusPage from './index';

describe('StatusPage route', () => {
  it('renders the status title from params', async () => {
    await render(<StatusPage />);
    expect(screen.getByText('Pesanan Berhasil Dibuat!')).toBeTruthy();
  });
});
