jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  completeOrderService,
  getDetailOrdersService,
  getMyOrdersService,
  getOrderMessagesService,
  getOrderReviewService,
  getOrdersService,
  getOrderTimelineService,
  getVoucherValidateService,
  onMessagesOrderService,
  onReceiptOrdersService,
  onReviewOrderService,
  onSubmitOrdersService,
} from './orders.services';

const bearerGet = APIBEARER.get as jest.Mock;
const bearerPost = APIBEARER.post as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getOrdersService', () => {
  it('gets /orders with params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { data: [] } });
    const out = await getOrdersService({ status: 'done', page: 1 });
    expect(out).toEqual({ data: [] });
    expect(bearerGet).toHaveBeenCalledWith('/orders', { params: { status: 'done', page: 1 } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getOrdersService({})).rejects.toThrow(SERVER_ERR);
  });
});

describe('getMyOrdersService', () => {
  it('gets /orders/mine with params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { data: [1] } });
    const out = await getMyOrdersService({ page: 2 });
    expect(out).toEqual({ data: [1] });
    expect(bearerGet).toHaveBeenCalledWith('/orders/mine', { params: { page: 2 } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getMyOrdersService({})).rejects.toThrow(SERVER_ERR);
  });
});

describe('getDetailOrdersService', () => {
  it('gets /orders/:id', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { id: 8 } });
    const out = await getDetailOrdersService(8);
    expect(out).toEqual({ id: 8 });
    expect(bearerGet).toHaveBeenCalledWith('/orders/8');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getDetailOrdersService(8)).rejects.toThrow(SERVER_ERR);
  });
});

describe('getOrderReviewService', () => {
  it('gets /orders/:id/review', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { r: 1 } });
    const out = await getOrderReviewService(4);
    expect(out).toEqual({ r: 1 });
    expect(bearerGet).toHaveBeenCalledWith('/orders/4/review');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getOrderReviewService(4)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onReviewOrderService', () => {
  it('posts /orders/:id/review with body', async () => {
    const body = { rating: 5, comment: 'ok' };
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onReviewOrderService(4, body);
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/orders/4/review', body);
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onReviewOrderService(4, {})).rejects.toThrow(SERVER_ERR);
  });
});

describe('onSubmitOrdersService', () => {
  it('posts /orders/create with data', async () => {
    const data = { warehouseId: 1, items: [] };
    bearerPost.mockResolvedValueOnce({ status: 200, data: { orderId: 99 } });
    const out = await onSubmitOrdersService(data);
    expect(out).toEqual({ orderId: 99 });
    expect(bearerPost).toHaveBeenCalledWith('/orders/create', data);
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onSubmitOrdersService({})).rejects.toThrow(SERVER_ERR);
  });
});

describe('completeOrderService', () => {
  it('posts /orders/:id/complete', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { success: true, snInserted: 3 } });
    const out = await completeOrderService(6);
    expect(out).toEqual({ success: true, snInserted: 3 });
    expect(bearerPost).toHaveBeenCalledWith('/orders/6/complete');
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(completeOrderService(6)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onReceiptOrdersService', () => {
  it('posts /orders/:id/confirm-receipt', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onReceiptOrdersService(6);
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/orders/6/confirm-receipt');
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onReceiptOrdersService(6)).rejects.toThrow(SERVER_ERR);
  });
});

describe('getVoucherValidateService', () => {
  it('gets /vouchers/validate with code + subTotal params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { valid: true } });
    const out = await getVoucherValidateService('HEMAT', 50000);
    expect(out).toEqual({ valid: true });
    expect(bearerGet).toHaveBeenCalledWith('/vouchers/validate', {
      params: { code: 'HEMAT', subTotal: 50000 },
    });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getVoucherValidateService('X', 1)).rejects.toThrow(SERVER_ERR);
  });
});

describe('getOrderMessagesService', () => {
  it('passes {since} when since.current is set', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getOrderMessagesService(3, { current: '2026-01-01' });
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/orders/3/messages', {
      params: { since: '2026-01-01' },
    });
  });
  it('passes empty params when since.current is falsy', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    await getOrderMessagesService(3, { current: null });
    expect(bearerGet).toHaveBeenCalledWith('/orders/3/messages', { params: {} });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getOrderMessagesService(3, { current: null })).rejects.toThrow(SERVER_ERR);
  });
});

describe('onMessagesOrderService', () => {
  it('posts trimmed body and accepts 2xx (201)', async () => {
    bearerPost.mockResolvedValueOnce({ status: 201, data: { id: 5 } });
    const out = await onMessagesOrderService(3, '  hi  ');
    expect(out).toEqual({ id: 5 });
    expect(bearerPost).toHaveBeenCalledWith('/orders/3/messages', { body: 'hi' });
  });
  it('accepts 200', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { id: 6 } });
    const out = await onMessagesOrderService(3, 'yo');
    expect(out).toEqual({ id: 6 });
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onMessagesOrderService(3, 'x')).rejects.toThrow(SERVER_ERR);
  });
});

describe('getOrderTimelineService', () => {
  it('passes {since} when since.current is set', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ step: 1 }] });
    const out = await getOrderTimelineService(3, { current: 't0' });
    expect(out).toEqual([{ step: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/orders/3/timeline', { params: { since: 't0' } });
  });
  it('passes empty params when since.current is falsy', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    await getOrderTimelineService(3, { current: undefined });
    expect(bearerGet).toHaveBeenCalledWith('/orders/3/timeline', { params: {} });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getOrderTimelineService(3, { current: null })).rejects.toThrow(SERVER_ERR);
  });
});
