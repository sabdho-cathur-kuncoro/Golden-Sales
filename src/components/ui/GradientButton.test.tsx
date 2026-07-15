import { render, screen, fireEvent } from '@testing-library/react-native';
import GradientButton from './GradientButton';

describe('GradientButton', () => {
  it('renders its title', async () => {
    await render(<GradientButton title="Lanjut" />);
    expect(screen.getByText('Lanjut')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<GradientButton title="Bayar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Bayar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides the title and drops onPress while loading', async () => {
    const onPress = jest.fn();
    const { toJSON } = await render(
      <GradientButton title="Bayar" onPress={onPress} loading />
    );
    expect(screen.queryByText('Bayar')).toBeNull();
    // pressable is disabled (opacity 0.6) and the press handler is undefined
    const json: any = toJSON();
    expect(json.props.onPress).toBeUndefined();
  });

  it('dims to 0.6 opacity and drops onPress when disabled', async () => {
    const onPress = jest.fn();
    const json: any = (
      await render(<GradientButton title="Bayar" onPress={onPress} disabled />)
    ).toJSON();
    const styles = [].concat(json.props.style).flat().filter(Boolean);
    expect(styles).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.6 })])
    );
    expect(json.props.onPress).toBeUndefined();
  });
});
