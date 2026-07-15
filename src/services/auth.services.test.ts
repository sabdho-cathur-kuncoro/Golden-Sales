// Local mocks hoist above imports (import/first ESLint warning is expected).
jest.mock('@/constants/API', () => ({
  APIBASIC: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  APIBEARER: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
  Config: { BASE_URL: 'http://test/sales', URL: 'http://test' },
}));
jest.mock('@/stores/auth.store', () => {
  const login = jest.fn();
  const setUser = jest.fn();
  return { useAuthStore: { getState: () => ({ login, setUser }) } };
});

import { APIBASIC, APIBEARER } from '@/constants/API';
import { useAuthStore } from '@/stores/auth.store';
import { STATUS_MESSAGES } from '@/utils/apiError';
import {
  getProfileService,
  onChangePasswordService,
  onForgotPasswordResetService,
  onForgotPasswordVerifyService,
  onLoginService,
  onSignupService,
  onUpdateProfileService,
} from './auth.services';

const basicPost = APIBASIC.post as jest.Mock;
const bearerGet = APIBEARER.get as jest.Mock;
const bearerPost = APIBEARER.post as jest.Mock;
const { login, setUser } = useAuthStore.getState() as any;

const SERVER_ERR = STATUS_MESSAGES[500];
const ctrl = { signal: 'sig' } as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProfileService', () => {
  it('sets user from data.data and returns 200', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { data: { id: 1, name: 'Budi' } } });
    const out = await getProfileService();
    expect(out).toBe(200);
    expect(bearerGet).toHaveBeenCalledWith('/me');
    expect(setUser).toHaveBeenCalledWith({ id: 1, name: 'Budi' });
  });
  it('falls back to bare data when no .data envelope', async () => {
    bearerGet.mockResolvedValueOnce({ status: 200, data: { id: 2 } });
    await getProfileService();
    expect(setUser).toHaveBeenCalledWith({ id: 2 });
  });
  it('throws mapped message on failure', async () => {
    bearerGet.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(getProfileService()).rejects.toThrow(SERVER_ERR);
  });
});

describe('onUpdateProfileService', () => {
  it('posts form with abort signal and returns data.data', async () => {
    const form = { phone: '08', email: 'a@b.c', username: 'x' };
    bearerPost.mockResolvedValueOnce({ status: 200, data: { data: { ok: true } } });
    const out = await onUpdateProfileService(form, ctrl);
    expect(out).toEqual({ ok: true });
    expect(bearerPost).toHaveBeenCalledWith('/me/profile', form, { signal: 'sig' });
  });
  it('handles missing controller', async () => {
    bearerPost.mockResolvedValueOnce({ status: 200, data: { v: 1 } });
    const out = await onUpdateProfileService({}, undefined);
    expect(out).toEqual({ v: 1 });
    expect(bearerPost).toHaveBeenCalledWith('/me/profile', {}, { signal: undefined });
  });
  it('throws mapped message on failure', async () => {
    bearerPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onUpdateProfileService({}, ctrl)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onLoginService', () => {
  it('logs in with token/refreshToken/user and returns 200', async () => {
    const data = { token: 't', refreshToken: 'r', name: 'Budi' };
    basicPost.mockResolvedValueOnce({ status: 200, data });
    const out = await onLoginService({ email: 'a' }, ctrl);
    expect(out).toBe(200);
    expect(basicPost).toHaveBeenCalledWith('/login', { email: 'a' }, { signal: 'sig' });
    expect(login).toHaveBeenCalledWith({ token: 't', refreshToken: 'r', user: data });
  });
  it('throws mapped message on failure', async () => {
    basicPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onLoginService({}, ctrl)).rejects.toThrow(SERVER_ERR);
    expect(login).not.toHaveBeenCalled();
  });
});

describe('onSignupService', () => {
  it('returns data.code on 200', async () => {
    basicPost.mockResolvedValueOnce({ status: 200, data: { code: 'ABC' } });
    const out = await onSignupService({ name: 'x' }, ctrl);
    expect(out).toBe('ABC');
    expect(basicPost).toHaveBeenCalledWith('/register', { name: 'x' }, { signal: 'sig' });
  });
  it('throws mapped message on failure', async () => {
    basicPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onSignupService({}, ctrl)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onForgotPasswordVerifyService', () => {
  it('returns resetToken + customerName', async () => {
    basicPost.mockResolvedValueOnce({
      status: 200,
      data: { resetToken: 'rt', customerName: 'Budi' },
    });
    const out = await onForgotPasswordVerifyService({ phone: '08' }, ctrl);
    expect(out).toEqual({ resetToken: 'rt', customerName: 'Budi' });
    expect(basicPost).toHaveBeenCalledWith('/forgot-password/verify', { phone: '08' }, { signal: 'sig' });
  });
  it('defaults customerName to empty string', async () => {
    basicPost.mockResolvedValueOnce({ status: 200, data: { resetToken: 'rt' } });
    const out = await onForgotPasswordVerifyService({}, ctrl);
    expect(out).toEqual({ resetToken: 'rt', customerName: '' });
  });
  it('throws mapped message on failure', async () => {
    basicPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onForgotPasswordVerifyService({}, ctrl)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onForgotPasswordResetService', () => {
  it('posts {resetToken,newPassword} and returns code', async () => {
    basicPost.mockResolvedValueOnce({ status: 200, data: { code: 'OK' } });
    const out = await onForgotPasswordResetService('rt', 'pw', ctrl);
    expect(out).toBe('OK');
    expect(basicPost).toHaveBeenCalledWith(
      '/forgot-password/reset',
      { resetToken: 'rt', newPassword: 'pw' },
      { signal: 'sig' }
    );
  });
  it('throws mapped message on failure', async () => {
    basicPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onForgotPasswordResetService('rt', 'pw', ctrl)).rejects.toThrow(SERVER_ERR);
  });
});

describe('onChangePasswordService', () => {
  it('posts to /me/password and returns code', async () => {
    basicPost.mockResolvedValueOnce({ status: 200, data: { code: 'OK' } });
    const out = await onChangePasswordService({ currentPassword: 'a', newPassword: 'b' }, ctrl);
    expect(out).toBe('OK');
    expect(basicPost).toHaveBeenCalledWith(
      '/me/password',
      { currentPassword: 'a', newPassword: 'b' },
      { signal: 'sig' }
    );
  });
  it('throws mapped message on failure', async () => {
    basicPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(onChangePasswordService({}, ctrl)).rejects.toThrow(SERVER_ERR);
  });
});
