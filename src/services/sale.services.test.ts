jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales' },
}));

import { APIBEARER } from '@/constants/API';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  checkCustomerCodeService,
  checkCustomerPhoneService,
  checkSellService,
  createCustomerService,
  getCustomerDetailService,
  getCustomersService,
  getPendingRegistrationsService,
  getReturnHistoryDetailService,
  getReturnHistoryService,
  getSalesManualService,
  getSalesWarehousesService,
  getSellHistoryDetailService,
  getSellHistoryService,
  getSellStockService,
  requestCustomerStatusService,
  submitSellService,
} from './sale.services';

const bearerGet = APIBEARER.get as jest.Mock;
const bearerPost = APIBEARER.post as jest.Mock;
const SERVER_ERR = STATUS_MESSAGES[500];
// 418 is not in STATUS_MESSAGES -> caller-supplied fallback is used.
const UNKNOWN = { response: { status: 418 } };

beforeEach(() => jest.clearAllMocks());

describe('getSellStockService', () => {
  it('gets /sell/stock', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { totalQty: 5, groups: [] } });
    const out = await getSellStockService();
    expect(out).toEqual({ totalQty: 5, groups: [] });
    expect(bearerGet).toHaveBeenCalledWith('/sell/stock');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getSellStockService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('checkSellService', () => {
  it('gets /sell/check with qr param', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { success: true } });
    const out = await checkSellService('QR123');
    expect(out).toEqual({ success: true });
    expect(bearerGet).toHaveBeenCalledWith('/sell/check', { params: { qr: 'QR123' } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(checkSellService('x')).rejects.toThrow(SERVER_ERR);
  });
});

describe('getCustomersService', () => {
  it('maps empty q/status to undefined', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    await getCustomersService({ q: '', status: '' });
    expect(bearerGet).toHaveBeenCalledWith('/customers', {
      params: { q: undefined, status: undefined },
    });
  });
  it('passes provided q/status', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getCustomersService({ q: 'ab', status: 'active' });
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/customers', {
      params: { q: 'ab', status: 'active' },
    });
  });
  it('works without arguments', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [] });
    await getCustomersService();
    expect(bearerGet).toHaveBeenCalledWith('/customers', {
      params: { q: undefined, status: undefined },
    });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getCustomersService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getPendingRegistrationsService', () => {
  it('gets /registrations/pending', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });
    const out = await getPendingRegistrationsService();
    expect(out).toEqual([{ id: 1 }]);
    expect(bearerGet).toHaveBeenCalledWith('/registrations/pending');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getPendingRegistrationsService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('getCustomerDetailService', () => {
  it('gets /customers/:id', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { customerName: 'Budi' } });
    const out = await getCustomerDetailService(10);
    expect(out).toEqual({ customerName: 'Budi' });
    expect(bearerGet).toHaveBeenCalledWith('/customers/10');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getCustomerDetailService(10)).rejects.toThrow(SERVER_ERR);
  });
});

describe('requestCustomerStatusService', () => {
  it('posts status-request body', async () => {
    const data = { newStatus: 'gold', reason: 'loyal' };
    bearerPost.mockResolvedValueOnce({ status: 200, data: { ok: true } });
    const out = await requestCustomerStatusService(3, data);
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/customers/3/status-request', data);
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerPost.mockRejectedValueOnce(UNKNOWN);
    await expect(
      requestCustomerStatusService(3, { newStatus: 'a', reason: 'b' })
    ).rejects.toThrow('Gagal mengirim request');
  });
});

describe('getSalesWarehousesService', () => {
  it('gets /warehouses', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: [{ id: 1, name: 'WH' }] });
    const out = await getSalesWarehousesService();
    expect(out).toEqual([{ id: 1, name: 'WH' }]);
    expect(bearerGet).toHaveBeenCalledWith('/warehouses');
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getSalesWarehousesService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('checkCustomerCodeService', () => {
  it('gets /customers/check-code with code param', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { available: true } });
    const out = await checkCustomerCodeService('C001');
    expect(out).toEqual({ available: true });
    expect(bearerGet).toHaveBeenCalledWith('/customers/check-code', { params: { code: 'C001' } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(checkCustomerCodeService('C001')).rejects.toThrow(SERVER_ERR);
  });
});

describe('checkCustomerPhoneService', () => {
  it('gets /customers/check-phone with phone param', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { available: false } });
    const out = await checkCustomerPhoneService('0812');
    expect(out).toEqual({ available: false });
    expect(bearerGet).toHaveBeenCalledWith('/customers/check-phone', { params: { phone: '0812' } });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(checkCustomerPhoneService('0812')).rejects.toThrow(SERVER_ERR);
  });
});

describe('createCustomerService', () => {
  it('accepts 200', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { message: 'ok' } });
    const out = await createCustomerService({ name: 'Budi' });
    expect(out).toEqual({ message: 'ok' });
    expect(bearerPost).toHaveBeenCalledWith('/customers', { name: 'Budi' });
  });
  it('accepts 201', async () => {
    bearerPost.mockResolvedValueOnce({ status: 201, data: { message: 'created' } });
    const out = await createCustomerService({ name: 'Budi' });
    expect(out).toEqual({ message: 'created' });
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerPost.mockRejectedValueOnce(UNKNOWN);
    await expect(createCustomerService({})).rejects.toThrow('Gagal mendaftar customer');
  });
});

describe('getSellHistoryService', () => {
  it('defaults page=1 pageSize=10 and undefined filters when no params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { data: [] } });
    const out = await getSellHistoryService();
    expect(out).toEqual({ data: [] });
    expect(bearerGet).toHaveBeenCalledWith('/sell/history', {
      params: { from: undefined, to: undefined, search: undefined, page: 1, pageSize: 10 },
    });
  });
  it('passes provided params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: {} });
    await getSellHistoryService({ from: 'a', to: 'b', search: 's', page: 3, pageSize: 20 });
    expect(bearerGet).toHaveBeenCalledWith('/sell/history', {
      params: { from: 'a', to: 'b', search: 's', page: 3, pageSize: 20 },
    });
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerGet.mockRejectedValueOnce(UNKNOWN);
    await expect(getSellHistoryService()).rejects.toThrow('Gagal memuat penjualan');
  });
});

describe('getSellHistoryDetailService', () => {
  it('gets encoded ref', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { items: [] } });
    const out = await getSellHistoryDetailService('SO/001 A');
    expect(out).toEqual({ items: [] });
    expect(bearerGet).toHaveBeenCalledWith('/sell/history/SO%2F001%20A');
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerGet.mockRejectedValueOnce(UNKNOWN);
    await expect(getSellHistoryDetailService('x')).rejects.toThrow('Gagal memuat detail');
  });
});

describe('getReturnHistoryService', () => {
  it('defaults page=1 pageSize=10 when no params', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { data: [] } });
    await getReturnHistoryService();
    expect(bearerGet).toHaveBeenCalledWith('/returns/history', {
      params: { from: undefined, to: undefined, search: undefined, page: 1, pageSize: 10 },
    });
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerGet.mockRejectedValueOnce(UNKNOWN);
    await expect(getReturnHistoryService()).rejects.toThrow('Gagal memuat pengembalian');
  });
});

describe('getReturnHistoryDetailService', () => {
  it('gets encoded ref', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { items: [] } });
    const out = await getReturnHistoryDetailService('RT/9');
    expect(out).toEqual({ items: [] });
    expect(bearerGet).toHaveBeenCalledWith('/returns/history/RT%2F9');
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerGet.mockRejectedValueOnce(UNKNOWN);
    await expect(getReturnHistoryDetailService('x')).rejects.toThrow('Gagal memuat detail');
  });
});

describe('getSalesManualService', () => {
  it('gets /manual', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { base64: 'AAA', fileName: 'm.pdf' } });
    const out = await getSalesManualService();
    expect(out).toEqual({ base64: 'AAA', fileName: 'm.pdf' });
    expect(bearerGet).toHaveBeenCalledWith('/manual');
  });
  it('throws custom fallback on unknown-status failure', async () => {
    bearerGet.mockRejectedValueOnce(UNKNOWN);
    await expect(getSalesManualService()).rejects.toThrow('Gagal memuat manual');
  });
});

describe('submitSellService', () => {
  it('posts /sell with data', async () => {
    const data = { items: [{ qr: 'q', unitPrice: 100 }], buyerName: 'B' };
    bearerPost.mockResolvedValueOnce({ status: 200, data: { success: true, totalAmount: 100 } });
    const out = await submitSellService(data);
    expect(out).toEqual({ success: true, totalAmount: 100 });
    expect(bearerPost).toHaveBeenCalledWith('/sell', data);
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(submitSellService({})).rejects.toThrow(SERVER_ERR);
  });
});
