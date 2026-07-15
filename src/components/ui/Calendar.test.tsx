import { render, screen, fireEvent } from '@testing-library/react-native';
import Calendar from './Calendar';

describe('Calendar', () => {
  it('renders the month/year label and weekday headers for the start month', async () => {
    await render(<Calendar start="2026-07-05" onSelectDay={() => {}} />);
    expect(screen.getByText('Juli 2026')).toBeTruthy();
    expect(screen.getByText('Min')).toBeTruthy();
    expect(screen.getByText('Sab')).toBeTruthy();
  });

  it('renders day cells and fires onSelectDay with the ISO date on tap', async () => {
    const onSelectDay = jest.fn();
    await render(<Calendar start="2026-07-05" onSelectDay={onSelectDay} />);
    fireEvent.press(screen.getByText('15'));
    expect(onSelectDay).toHaveBeenCalledWith('2026-07-15');
  });

  it('advances to the next month when the next-month button is pressed', async () => {
    await render(<Calendar start="2026-07-05" onSelectDay={() => {}} />);
    // The nav row holds [prev, monthLabel, next]; the next-month button is the
    // label's last sibling (the chevron buttons carry no text to query by).
    const label: any = screen.getByText('Juli 2026');
    const siblings = label.parent.children.filter((c: any) => typeof c !== 'string');
    fireEvent.press(siblings[siblings.length - 1]);
    // month switch is a deferred state update — wait for the new label.
    expect(await screen.findByText('Agustus 2026')).toBeTruthy();
  });
});
