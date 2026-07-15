jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));
jest.mock('@/storage/product.cache', () => ({
  productsCache: { upsertMany: jest.fn(), getAll: jest.fn() },
}));

import { APIBEARER } from '@/constants/API';
import { productsCache } from '@/storage/product.cache';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  getDetailProductsService,
  getProductsCachedService,
  getProductsService,
} from './products.services';

const bearerGet = APIBEARER.get as jest.Mock;
const upsertMany = productsCache.upsertMany as jest.Mock;
const getAll = productsCache.getAll as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getProductsService', () => {
  it('gets all products without params when no warehouseId', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getProductsService();
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/products/GetAll', { params: undefined });
  });
  it('passes warehouseId param when provided', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    await getProductsService(7);
    expect(bearerGet).toHaveBeenCalledWith('/products/GetAll', { params: { warehouseId: 7 } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getProductsService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getProductsCachedService', () => {
  it('online: fetches, upserts under scope, returns fresh data', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }, { id: 2 }] });
    const out = await getProductsCachedService(7);
    expect(out).toEqual([{ id: 1 }, { id: 2 }]);
    expect(upsertMany).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }], '7');
    expect(getAll).not.toHaveBeenCalled();
  });
  it('uses "all" scope when no warehouseId', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 9 }] });
    await getProductsCachedService();
    expect(upsertMany).toHaveBeenCalledWith([{ id: 9 }], 'all');
  });
  it('does not upsert an empty list but still returns it', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    const out = await getProductsCachedService(7);
    expect(out).toEqual([]);
    expect(upsertMany).not.toHaveBeenCalled();
  });
  it('offline/error: falls back to cached rows for scope', async () => {
    bearerGet.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
    getAll.mockResolvedValueOnce([{ id: 5, cached: true }]);
    const out = await getProductsCachedService(3);
    expect(out).toEqual([{ id: 5, cached: true }]);
    expect(getAll).toHaveBeenCalledWith('3');
    expect(upsertMany).not.toHaveBeenCalled();
  });
});

describe('getDetailProductsService', () => {
  it('gets details without params when no warehouseId', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { id: 'p1' } });
    const out = await getDetailProductsService('p1');
    expect(out).toEqual({ id: 'p1' });
    expect(bearerGet).toHaveBeenCalledWith('/products/Details/p1', { params: undefined });
  });
  it('passes warehouseId param when provided', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: {} });
    await getDetailProductsService('p1', 4);
    expect(bearerGet).toHaveBeenCalledWith('/products/Details/p1', { params: { warehouseId: 4 } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getDetailProductsService('p1')).rejects.toThrow(SERVER_ERR);
  });
});
