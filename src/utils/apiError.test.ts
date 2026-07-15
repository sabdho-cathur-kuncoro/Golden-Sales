import { getApiErrorMessage, STATUS_MESSAGES } from '@/utils/apiError';

const NETWORK = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
const TIMEOUT = 'Koneksi ke server timeout. Silakan coba lagi.';
const DEFAULT = 'Terjadi Kesalahan';

describe('getApiErrorMessage', () => {
  describe('no connection (highest priority)', () => {
    it('maps ERR_NETWORK code', () => {
      expect(getApiErrorMessage({ code: 'ERR_NETWORK' })).toBe(NETWORK);
    });
    it('maps request-without-response', () => {
      expect(getApiErrorMessage({ request: {}, response: undefined })).toBe(NETWORK);
    });
    it('maps /network error/i in message', () => {
      expect(getApiErrorMessage({ message: 'Network Error' })).toBe(NETWORK);
    });
    it('network wins over a present status', () => {
      expect(
        getApiErrorMessage({ code: 'ERR_NETWORK', response: { status: 500 } })
      ).toBe(NETWORK);
    });
  });

  describe('timeout', () => {
    it('maps ECONNABORTED', () => {
      expect(getApiErrorMessage({ code: 'ECONNABORTED' })).toBe(TIMEOUT);
    });
    it('maps /timeout/i in message', () => {
      expect(getApiErrorMessage({ message: 'timeout of 5000ms exceeded' })).toBe(TIMEOUT);
    });
  });

  describe('backend message trusted as-is', () => {
    it('returns response.data.message', () => {
      expect(
        getApiErrorMessage({ response: { status: 400, data: { message: 'Stok habis' } } })
      ).toBe('Stok habis');
    });
    it('backend message wins over status map', () => {
      expect(
        getApiErrorMessage({ response: { status: 500, data: { message: 'Custom' } } })
      ).toBe('Custom');
    });
    it('ignores blank/whitespace backend message, falls to status map', () => {
      expect(
        getApiErrorMessage({ response: { status: 404, data: { message: '   ' } } })
      ).toBe(STATUS_MESSAGES[404]);
    });
  });

  describe('status map', () => {
    it.each(Object.keys(STATUS_MESSAGES).map(Number))('maps status %i', (status) => {
      expect(getApiErrorMessage({ response: { status } })).toBe(STATUS_MESSAGES[status]);
    });
  });

  describe('fallback', () => {
    it('uses default fallback for unknown error', () => {
      expect(getApiErrorMessage({})).toBe(DEFAULT);
      expect(getApiErrorMessage(null)).toBe(DEFAULT);
      expect(getApiErrorMessage({ response: { status: 418 } })).toBe(DEFAULT);
    });
    it('uses caller-supplied fallback', () => {
      expect(getApiErrorMessage({ response: { status: 418 } }, 'Gagal memuat')).toBe(
        'Gagal memuat'
      );
    });
  });
});
