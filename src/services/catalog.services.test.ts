jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import { getCategoriesProduct, getDetailsCategoryProduct } from './catalog.services';

const bearerGet = APIBEARER.get as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getCategoriesProduct', () => {
  it('gets undeleted categories and returns data', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getCategoriesProduct();
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('svc/Categories/GetDataUnDeleted');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getCategoriesProduct()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getDetailsCategoryProduct', () => {
  it('gets subcategories by category id', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 2 }] });
    const out = await getDetailsCategoryProduct(42);
    expect(out).toEqual([{ id: 2 }]);
    expect(bearerGet).toHaveBeenCalledWith('svc/SubCategories/GetDataByCategoryId/42');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getDetailsCategoryProduct(42)).rejects.toThrow(SERVER_ERR);
  });
});
