import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Info } from 'lucide-react-native';
import Accordion from './Accordion';

describe('Accordion', () => {
  it('renders the title and hides children when closed', async () => {
    await render(
      <Accordion icon={Info} title="Pengiriman" isOpen={false} onToggle={() => {}}>
        <Text>Isi panel</Text>
      </Accordion>
    );
    expect(screen.getByText('Pengiriman')).toBeTruthy();
    expect(screen.queryByText('Isi panel')).toBeNull();
  });

  it('reveals children when open', async () => {
    await render(
      <Accordion icon={Info} title="Pengiriman" isOpen onToggle={() => {}}>
        <Text>Isi panel</Text>
      </Accordion>
    );
    expect(screen.getByText('Isi panel')).toBeTruthy();
  });

  it('fires onToggle when the header is pressed', async () => {
    const onToggle = jest.fn();
    await render(
      <Accordion icon={Info} title="Pengiriman" isOpen={false} onToggle={onToggle}>
        <Text>Isi panel</Text>
      </Accordion>
    );
    fireEvent.press(screen.getByText('Pengiriman'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
