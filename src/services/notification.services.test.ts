jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  getNotifCountService,
  getNotifService,
  onReadAllNotifService,
  onReadNotifService,
} from './notification.services';

const bearerGet = APIBEARER.get as jest.Mock;
const bearerPost = APIBEARER.post as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getNotifService', () => {
  it('gets /notifications with params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { items: [] } });
    const out = await getNotifService({ pageSize: 50 });
    expect(out).toEqual({ items: [] });
    expect(bearerGet).toHaveBeenCalledWith('/notifications', { params: { pageSize: 50 } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getNotifService({})).rejects.toThrow(SERVER_ERR);
  });
});

describe('getNotifCountService', () => {
  it('gets /notifications/count', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { count: 4 } });
    const out = await getNotifCountService();
    expect(out).toEqual({ count: 4 });
    expect(bearerGet).toHaveBeenCalledWith('/notifications/count');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getNotifCountService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('onReadNotifService', () => {
  it('posts read for the given notif id', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onReadNotifService({ id: 12 });
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/notifications/12/read');
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onReadNotifService({ id: 12 })).rejects.toThrow(SERVER_ERR);
  });
});

describe('onReadAllNotifService', () => {
  it('posts read-all', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await onReadAllNotifService();
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/notifications/read-all');
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onReadAllNotifService()).rejects.toThrow(SERVER_ERR);
  });
});
