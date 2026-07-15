// Smoke: presentational StatusScreen — render with explicit props.
import { render, screen } from '@testing-library/react-native';
import StatusScreen from './StatusScreen';

describe('StatusScreen component', () => {
  it('renders title, message and primary action', async () => {
    await render(
      <StatusScreen
        type="success"
        title="Berhasil"
        message="Pesanan diproses"
        primaryAction={{ title: 'Kembali ke Home', onPress: () => {} }}
      />
    );
    expect(screen.getByText('Berhasil')).toBeTruthy();
    expect(screen.getByText('Kembali ke Home')).toBeTruthy();
  });
});
