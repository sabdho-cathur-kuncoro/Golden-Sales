import { render, screen, fireEvent } from '@testing-library/react-native';
import TransferGuide from './TransferGuide';

describe('TransferGuide', () => {
  it('renders all three transfer-method section titles', async () => {
    await render(<TransferGuide bankName="BCA" />);
    expect(screen.getByText('Petunjuk Transfer via m-Banking')).toBeTruthy();
    expect(screen.getByText('Petunjuk Transfer via i-Banking')).toBeTruthy();
    expect(screen.getByText('Petunjuk Transfer via ATM')).toBeTruthy();
  });

  it('keeps step details collapsed until a section is tapped', async () => {
    await render(<TransferGuide bankName="BCA" />);
    expect(screen.queryByText(/Buka aplikasi m-Banking BCA/)).toBeNull();
    fireEvent.press(screen.getByText('Petunjuk Transfer via m-Banking'));
    expect(await screen.findByText(/Buka aplikasi m-Banking BCA/)).toBeTruthy();
    // note block also becomes visible
    expect(screen.getByText('Catatan Penting')).toBeTruthy();
  });

  it('interpolates the bank name into the ATM steps', async () => {
    await render(<TransferGuide bankName="Mandiri" />);
    fireEvent.press(screen.getByText('Petunjuk Transfer via ATM'));
    expect(await screen.findByText(/Masukkan kartu ATM Mandiri/)).toBeTruthy();
  });
});
