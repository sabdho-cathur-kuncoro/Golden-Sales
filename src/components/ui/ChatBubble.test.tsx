import { render, screen } from '@testing-library/react-native';
import ChatBubble from './ChatBubble';

const renderBubble = (props: any) => render(<ChatBubble {...props} />);

describe('ChatBubble', () => {
  it('renders a day separator', async () => {
    await renderBubble({ data: { type: 'day', date: '13 Juli 2026' } });
    expect(screen.getByText('13 Juli 2026')).toBeTruthy();
  });

  it('renders an incoming (recipient) message with text and time', async () => {
    await renderBubble({ data: { sender_id: 'CUST-1', message: 'Halo sales', time: '11:20' } });
    expect(screen.getByText('Halo sales')).toBeTruthy();
    expect(screen.getByText('11:20')).toBeTruthy();
  });

  it('renders an outgoing (own) message for the current sender', async () => {
    await renderBubble({ data: { sender_id: 'SLS-001', message: 'Siap kirim', time: '11:25' } });
    expect(screen.getByText('Siap kirim')).toBeTruthy();
    expect(screen.getByText('11:25')).toBeTruthy();
  });

  it('falls back to placeholders when message/time are missing', async () => {
    await renderBubble({ data: { sender_id: 'CUST-2' } });
    // both message and time fall back to "-"
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });
});
