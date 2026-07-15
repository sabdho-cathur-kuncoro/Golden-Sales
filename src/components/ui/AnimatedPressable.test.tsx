import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import AnimatedPressable from './AnimatedPressable';

describe('AnimatedPressable', () => {
  it('renders its children', async () => {
    await render(
      <AnimatedPressable>
        <Text>Tekan</Text>
      </AnimatedPressable>
    );
    expect(screen.getByText('Tekan')).toBeTruthy();
  });

  it('fires onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(
      <AnimatedPressable onPress={onPress}>
        <Text>Tekan</Text>
      </AnimatedPressable>
    );
    fireEvent.press(screen.getByText('Tekan'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(
      <AnimatedPressable onPress={onPress} disabled>
        <Text>Tekan</Text>
      </AnimatedPressable>
    );
    fireEvent.press(screen.getByText('Tekan'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('fires onPress on press-in when fireOnPressIn is set', async () => {
    const onPress = jest.fn();
    await render(
      <AnimatedPressable onPress={onPress} fireOnPressIn>
        <Text>Tekan</Text>
      </AnimatedPressable>
    );
    // With fireOnPressIn the handler is wired to onPressIn, not the Pressable's
    // onPress (which is undefined) — a press-in alone triggers it.
    fireEvent(screen.getByText('Tekan'), 'pressIn');
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
