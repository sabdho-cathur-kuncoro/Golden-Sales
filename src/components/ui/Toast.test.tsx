import { render, screen, act } from '@testing-library/react-native';

// react-native-worklets is not covered by the global native mocks and throws
// on import ("Native part of Worklets doesn't seem to be initialized"). Toast
// imports `scheduleOnRN` from it, so stub it locally as a synchronous passthrough.
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  scheduleOnRN: (fn: any, ...args: any[]) => fn?.(...args),
  runOnJS: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
}));

import AppToast from './Toast';
import { useToastStore } from '@/stores/toast.store';

const aToast = (over: Partial<any> = {}) => ({
  id: 1,
  title: 'Berhasil',
  message: 'Data tersimpan',
  icon: 'check',
  color: '#fff',
  borderColor: '#fff',
  fromBGColor: '#0a0',
  toBGColor: '#0f0',
  ...over,
});

describe('AppToast', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [], duration: 3000 });
  });

  it('renders nothing when there are no toasts', async () => {
    await render(<AppToast />);
    expect(screen.queryByText('Berhasil')).toBeNull();
  });

  it('renders the toast title and message from the store', async () => {
    await render(<AppToast />);
    await act(async () => {
      useToastStore.setState({ toasts: [aToast()] });
    });
    expect(screen.getByText('Berhasil')).toBeTruthy();
    expect(screen.getByText('Data tersimpan')).toBeTruthy();
  });

  it('renders each toast in the stack', async () => {
    await render(<AppToast />);
    await act(async () => {
      useToastStore.setState({
        toasts: [
          aToast({ id: 1, title: 'Satu' }),
          aToast({ id: 2, title: 'Dua' }),
        ],
      });
    });
    expect(screen.getByText('Satu')).toBeTruthy();
    expect(screen.getByText('Dua')).toBeTruthy();
  });
});
