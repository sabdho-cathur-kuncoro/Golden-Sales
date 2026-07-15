import { render, screen, fireEvent } from '@testing-library/react-native';

// FormPassword pulls in ../ui (index) → Toast → react-native-worklets, which is
// not globally mocked and throws on import. Stub it locally as a passthrough.
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  scheduleOnRN: (fn: any, ...args: any[]) => fn?.(...args),
  runOnJS: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
}));

import FormPassword from './FormPassword';

// The eye toggle flips secureTextEntry on the underlying TextInput.
describe('FormPassword', () => {
  it('renders its label', async () => {
    await render(<FormPassword label="Kata Sandi" />);
    expect(screen.getByText('Kata Sandi')).toBeTruthy();
  });

  it('fires onChangeText when the field is edited', async () => {
    const onChangeText = jest.fn();
    // Default (masked) placeholder is "********".
    await render(
      <FormPassword label="Kata Sandi" onChangeText={onChangeText} />
    );
    fireEvent.changeText(screen.getByPlaceholderText('********'), 'rahasia');
    expect(onChangeText).toHaveBeenCalledWith('rahasia');
  });

  it('starts masked and toggles secureTextEntry when the eye icon is pressed', async () => {
    await render(
      <FormPassword label="Kata Sandi" placeholderVisible="isi sandi" />
    );

    // Masked at first: secureTextEntry true, masked placeholder shown.
    const masked = screen.getByPlaceholderText('********');
    expect(masked.props.secureTextEntry).toBe(true);

    // The eye toggle is the icon-only sibling of the input inside the row.
    // (No text/role/testID handle, so reach it via the input's parent.)
    const toggle = (masked.parent as any).children.find(
      (c: any) => c !== masked && typeof c !== 'string'
    );
    await fireEvent.press(toggle);

    // Now revealed: secureTextEntry false, visible placeholder shown.
    const revealed = screen.getByPlaceholderText('isi sandi');
    expect(revealed.props.secureTextEntry).toBe(false);
  });
});
