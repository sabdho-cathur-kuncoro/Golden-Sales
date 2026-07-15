import { render, screen } from '@testing-library/react-native';

// [id] screen: provide params via a local expo-router override.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'ORD-2026-001', statusOrder: '5' }),
}));

import ReportDetail from './[id]';

describe('ReportDetail screen (smoke)', () => {
  it('mounts and shows the header', async () => {
    await render(<ReportDetail />);
    expect(screen.getByText('Detail Laporan')).toBeTruthy();
  });
});
