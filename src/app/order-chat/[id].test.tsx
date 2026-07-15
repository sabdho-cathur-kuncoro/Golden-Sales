// SMOKE: order-chat/[id] mounts + shows its header (title = orderId param).
// The messages service is mocked (network-free, empty). Local expo-router
// supplies id/orderId/status. The global react-native-keyboard-controller mock
// lacks KeyboardAvoidingView (see report) — added locally here.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: '55', orderId: 'SO-55', status: 'Menunggu Konfirmasi' }),
  useIsFocused: () => true,
}));
jest.mock('react-native-keyboard-controller', () => ({
  __esModule: true,
  KeyboardAvoidingView: ({ children }: any) => children ?? null,
  KeyboardProvider: ({ children }: any) => children ?? null,
  useKeyboardHandler: () => {},
}));
jest.mock('@/services/orders.services', () => ({
  __esModule: true,
  getOrderMessagesService: jest.fn(async () => []),
  onMessagesOrderService: jest.fn(async () => ({})),
}));

import { render, screen } from '@testing-library/react-native';
import OrderChat from './[id]';

describe('Order chat screen (smoke)', () => {
  it('mounts and renders the header title from the orderId param', async () => {
    await render(<OrderChat />);
    expect(await screen.findByText('SO-55')).toBeTruthy();
  });
});
