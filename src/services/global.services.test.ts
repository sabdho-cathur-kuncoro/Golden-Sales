jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBASIC, APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  getAppVersionService,
  getFlashSaleService,
  getSlidersService,
  getWarehousesService,
} from './global.services';

const bearerGet = APIBEARER.get as jest.Mock;
const basicGet = APIBASIC.get as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];

beforeEach(() => jest.clearAllMocks());

describe('getWarehousesService', () => {
  it('returns data', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getWarehousesService();
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/warehouses');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getWarehousesService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getSlidersService', () => {
  it('projects id + image(base64) from each slider', async () => {
    bearerGet.mockResolvedValueOnce({
      status: 200,
      data: [
        { id: 1, imageBase64: 'aaa', extra: 'ignore' },
        { id: 2, imageBase64: 'bbb' },
      ],
    });
    const out = await getSlidersService();
    expect(out).toEqual([
      { id: 1, image: 'aaa' },
      { id: 2, image: 'bbb' },
    ]);
    expect(bearerGet).toHaveBeenCalledWith('/sliders');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getSlidersService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getFlashSaleService', () => {
  it('returns data', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 3 }] });
    const out = await getFlashSaleService();
    expect(out).toEqual([{ id: 3 }]);
    expect(bearerGet).toHaveBeenCalledWith('/flash-sales');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getFlashSaleService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getAppVersionService', () => {
  it('gets version via APIBASIC with Field_key param', async () => {
    basicGet.mockResolvedValueOnce({ status: 200, data: { version: '1.0.0' } });
    const out = await getAppVersionService('android');
    expect(out).toEqual({ version: '1.0.0' });
    expect(basicGet).toHaveBeenCalledWith('/getVersionApp', { params: { Field_key: 'android' } });
  });
  it('throws mapped message on failure', async () => {
    basicGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getAppVersionService('android')).rejects.toThrow(SERVER_ERR);
  });
});
