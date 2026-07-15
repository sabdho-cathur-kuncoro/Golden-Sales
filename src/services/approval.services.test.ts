jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  getApprovalService,
  onDeleteApprovalService,
  onRejectApprovalService,
  onSubmitApprovalService,
} from './approval.services';

const bearerGet = APIBEARER.get as jest.Mock;
const bearerPost = APIBEARER.post as jest.Mock;
const bearerDelete = APIBEARER.delete as jest.Mock;

const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getApprovalService', () => {
  it('gets /orders/:id/review and returns data', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { id: 7 } });
    const out = await getApprovalService(7);
    expect(out).toEqual({ id: 7 });
    expect(bearerGet).toHaveBeenCalledWith('/orders/7/review');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getApprovalService(7)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onSubmitApprovalService', () => {
  it('posts /orders/:id/approve and returns data', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onSubmitApprovalService(3);
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/orders/3/approve');
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onSubmitApprovalService(3)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onRejectApprovalService', () => {
  it('posts /orders/:id/reject with reason body', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onRejectApprovalService(9, 'stok kosong');
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/orders/9/reject', { reason: 'stok kosong' });
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onRejectApprovalService(9, 'x')).rejects.toThrow(SERVER_ERR);
  });
});

describe('onDeleteApprovalService', () => {
  it('deletes /orders/:id/items/:itemId', async () => {
    bearerDelete.mockResolvedValueOnce({ status: 200, data: { removed: true } });
    const out = await onDeleteApprovalService(5, 22);
    expect(out).toEqual({ removed: true });
    expect(bearerDelete).toHaveBeenCalledWith('/orders/5/items/22');
  });
  it('throws mapped message on failure', async () => {
    bearerDelete.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onDeleteApprovalService(5, 22)).rejects.toThrow(SERVER_ERR);
  });
});
