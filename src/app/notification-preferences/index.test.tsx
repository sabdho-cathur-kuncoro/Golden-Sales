import { render, screen } from '@testing-library/react-native';
import NotificationPreferences from './index';

// Smoke: notification preferences screen with static toggles.
describe('NotificationPreferences screen', () => {
  it('mounts and shows the header', async () => {
    await render(<NotificationPreferences />);
    expect(screen.getByText('Preferensi Notifikasi')).toBeTruthy();
  });
});
