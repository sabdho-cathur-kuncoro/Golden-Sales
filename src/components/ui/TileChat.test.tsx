import { render, screen, fireEvent } from '@testing-library/react-native';
import TileChat from './TileChat';

const renderChat = (props: any) => render(<TileChat {...props} />);

describe('TileChat', () => {
  it('renders a day separator row', async () => {
    await renderChat({ data: { type: 'day', date: '12 Juli 2026' } });
    expect(screen.getByText('12 Juli 2026')).toBeTruthy();
  });

  it('renders an order chat row with id, message and time', async () => {
    await renderChat({
      data: { order_id: 'ORD-001', message: 'Halo, pesanan siap', time: '10:30' },
    });
    expect(screen.getByText('ORD-001')).toBeTruthy();
    expect(screen.getByText('Halo, pesanan siap')).toBeTruthy();
    expect(screen.getByText('10:30')).toBeTruthy();
  });

  it('shows the unread badge count when unread_message > 0', async () => {
    await renderChat({
      data: { order_id: 'ORD-002', message: 'm', time: '09:00', unread_message: 4 },
    });
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('fires onPress when the row is tapped', async () => {
    const onPress = jest.fn();
    await renderChat({ data: { order_id: 'ORD-003', message: 'ping', time: '08:00' }, onPress });
    fireEvent.press(screen.getByText('ORD-003'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
