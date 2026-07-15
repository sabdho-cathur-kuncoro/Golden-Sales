import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('renders its title', async () => {
    await render(<Button title="Simpan" />);
    expect(screen.getByText('Simpan')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button title="Kirim" onPress={onPress} />);
    fireEvent.press(screen.getByText('Kirim'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('dims to opacity 0.5 and drops its onPress handler when disabled', async () => {
    const onPress = jest.fn();
    const json: any = (
      await render(<Button title="Kirim" onPress={onPress} disabled />)
    ).toJSON();
    // The disabled affordance: 50% opacity in the composed style...
    const styles = [].concat(json.props.style).flat().filter(Boolean);
    expect(styles).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })])
    );
    // ...and no press responder wired on the host (onPress → undefined).
    expect(json.props.onPress).toBeUndefined();
  });
});
