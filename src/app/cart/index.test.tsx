// Smoke: Cart screen mounts (empty cart) and shows the empty-state anchor.
// useFocusEffect is a no-op in the global expo-router mock, so refresh() never
// fires — the real cart store, seeded empty, drives the empty state.
//
// The global react-native-keyboard-controller mock omits KeyboardAvoidingView
// (which this screen imports), so provide it locally as a passthrough.
jest.mock('react-native-keyboard-controller', () => ({
  __esModule: true,
  KeyboardProvider: ({ children }: any) => children ?? null,
  KeyboardAvoidingView: ({ children }: any) => children ?? null,
  KeyboardAwareScrollView: ({ children }: any) => children ?? null,
  KeyboardController: { dismiss: jest.fn() },
  useKeyboardHandler: () => {},
}));

import { render, screen } from '@testing-library/react-native';
import { useCartStore } from '@/stores/cart.store';
import Cart from './index';

beforeEach(() => {
  useCartStore.setState({ items: [], warehouse: null, hydrated: true });
});

describe('Cart screen', () => {
  it('renders the empty-cart state', async () => {
    await render(<Cart />);
    expect(screen.getByText('Keranjang kamu masih kosong')).toBeTruthy();
  });
});
