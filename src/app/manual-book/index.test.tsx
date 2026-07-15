// SMOKE: manual-book route mounts + shows its header. The manual service is
// mocked (network-free); react-native-pdf is globally mocked. The screen imports
// expo-file-system/legacy (only 'expo-file-system' is globally mocked) — a local
// mock covers the subpath so the module resolves at import time.
jest.mock('expo-file-system/legacy', () => ({
  __esModule: true,
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn(async () => {}),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(async () => ({ granted: false })),
    createFileAsync: jest.fn(async () => 'file:///doc/out.pdf'),
  },
}));
jest.mock('@/services/sale.services', () => ({
  __esModule: true,
  getSalesManualService: jest.fn(async () => ({ title: 'Buku Manual Sales' })),
}));

import { render, screen } from '@testing-library/react-native';
import ManualBook from './index';

describe('Manual book screen (smoke)', () => {
  it('mounts and renders the header', async () => {
    await render(<ManualBook />);
    expect(await screen.findByText('Buku Manual')).toBeTruthy();
  });
});
