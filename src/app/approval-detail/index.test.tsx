// SMOKE: approval detail route mounts + shows its header. Order + timeline
// services are mocked so the effect resolves to a minimal order; local
// expo-router supplies the [id] param.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: '123' }),
  useIsFocused: () => true,
}));
jest.mock('@/services/orders.services', () => ({
  __esModule: true,
  getDetailOrdersService: jest.fn(async () => ({
    orderNumber: 'SO-123',
    status: 'Menunggu Konfirmasi',
    total: 0,
    items: [],
    customer: {},
  })),
  getOrderTimelineService: jest.fn(async () => ({ events: [] })),
}));
jest.mock('@/services/approval.services', () => ({
  __esModule: true,
  onDeleteApprovalService: jest.fn(),
  onRejectApprovalService: jest.fn(),
  onSubmitApprovalService: jest.fn(),
}));

import { render, screen } from '@testing-library/react-native';
import ApprovalDetail from './index';

describe('Approval detail screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<ApprovalDetail />);
    expect(await screen.findByText('Detail Approval')).toBeTruthy();
  });
});
