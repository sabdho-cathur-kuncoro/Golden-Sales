import { render, screen } from '@testing-library/react-native';
import StatusRow from './StatusRow';

describe('StatusRow', () => {
  it('renders a completed step with name and timestamp', async () => {
    await render(
      <StatusRow data={{ id: 1, status_name: 'Disetujui', created_at: '14 Jul 10:00', step_done: true }} />
    );
    expect(screen.getByText('Disetujui')).toBeTruthy();
    expect(screen.getByText('14 Jul 10:00')).toBeTruthy();
  });

  it('renders the current (active) step with its timestamp', async () => {
    await render(
      <StatusRow data={{ id: 2, status_name: 'Diproses', created_at: '14 Jul 11:00', current_step: true }} />
    );
    expect(screen.getByText('Diproses')).toBeTruthy();
    expect(screen.getByText('14 Jul 11:00')).toBeTruthy();
  });

  it('renders an inactive future step name but hides its timestamp', async () => {
    await render(
      <StatusRow data={{ id: 3, status_name: 'Dikirim', created_at: 'kelak' }} />
    );
    expect(screen.getByText('Dikirim')).toBeTruthy();
    expect(screen.queryByText('kelak')).toBeNull();
  });

  it('renders a rejected step name', async () => {
    await render(
      <StatusRow data={{ id: 4, status_name: 'Ditolak', is_reject: true }} />
    );
    expect(screen.getByText('Ditolak')).toBeTruthy();
  });
});
