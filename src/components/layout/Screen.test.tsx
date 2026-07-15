import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import Screen from './Screen';

// SafeAreaView is globally mocked to a passthrough, so children render straight.
describe('Screen', () => {
  it('renders its children', async () => {
    await render(
      <Screen>
        <Text>Konten Halaman</Text>
      </Screen>
    );
    expect(screen.getByText('Konten Halaman')).toBeTruthy();
  });
});
