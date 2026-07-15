import { render, screen, fireEvent } from '@testing-library/react-native';

// FormInput pulls in ../ui (index) → Toast → react-native-worklets, which is not
// globally mocked and throws on import. Stub it locally as a passthrough.
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  scheduleOnRN: (fn: any, ...args: any[]) => fn?.(...args),
  runOnJS: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
}));

import FormInput from './FormInput';

describe('FormInput', () => {
  it('renders the label and placeholder', async () => {
    await render(<FormInput label="Nama" placeholder="Masukkan nama" />);
    expect(screen.getByText('Nama')).toBeTruthy();
    expect(screen.getByPlaceholderText('Masukkan nama')).toBeTruthy();
  });

  it('renders the error text when provided', async () => {
    await render(<FormInput label="Nama" error="Wajib diisi" />);
    expect(screen.getByText('Wajib diisi')).toBeTruthy();
  });

  it('fires onChangeText when the field is edited', async () => {
    const onChangeText = jest.fn();
    await render(
      <FormInput
        label="Nama"
        placeholder="Masukkan nama"
        onChangeText={onChangeText}
      />
    );
    fireEvent.changeText(screen.getByPlaceholderText('Masukkan nama'), 'Budi');
    expect(onChangeText).toHaveBeenCalledWith('Budi');
  });
});
