// SMOKE: notifikasi/[id] (a chat DetailSection) mounts + shows its header
// (Header title = the [id] param). Local expo-router supplies the param. The
// global react-native-keyboard-controller mock lacks KeyboardControllerView
// (see report) — added locally here.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'SO-777' }),
  useIsFocused: () => true,
}));
jest.mock('react-native-keyboard-controller', () => ({
  __esModule: true,
  KeyboardControllerView: ({ children }: any) => children ?? null,
  KeyboardProvider: ({ children }: any) => children ?? null,
  useKeyboardHandler: () => {},
}));
// ChatBubble (src/components/ui/ChatBubble.tsx) is declared `async function` —
// React 19 rejects async client components, so any rendered chat row throws.
// That's a pre-existing source bug; force an empty chat list so the smoke test
// still mounts the screen's own tree via the empty state (see report).
jest.mock('../../../utils/helper', () => ({
  __esModule: true,
  generateChat: () => [],
  wait: () => Promise.resolve(),
}));

import { render, screen } from '@testing-library/react-native';
import DetailSection from './[id]';

describe('Notifikasi detail (chat) screen (smoke)', () => {
  it('mounts and renders the header title from the id param', async () => {
    await render(<DetailSection />);
    expect(await screen.findByText('SO-777')).toBeTruthy();
  });
});
