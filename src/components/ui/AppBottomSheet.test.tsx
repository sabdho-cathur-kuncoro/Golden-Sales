import { render, screen, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import AppBottomSheet from './AppBottomSheet';
import { useBottomSheetStore } from '@/stores/bottomSheet.store';

// @gorhom/bottom-sheet is globally mocked to a passthrough, so the store's
// content/header/footer render straight through once the sheet is open.
const closedState = {
  isOpen: false,
  content: null,
  header: null,
  footer: null,
  snapPoints: ['50%'],
};

describe('AppBottomSheet', () => {
  beforeEach(() => {
    useBottomSheetStore.setState(closedState);
  });

  it('renders nothing while closed', async () => {
    await render(<AppBottomSheet />);
    expect(screen.queryByText('Isi Sheet')).toBeNull();
  });

  it('renders the store content, header and footer once opened', async () => {
    await render(<AppBottomSheet />);
    await act(async () => {
      useBottomSheetStore
        .getState()
        .open(
          <Text>Isi Sheet</Text>,
          ['50%'],
          <Text>Judul Header</Text>,
          <Text>Footer Aksi</Text>
        );
    });
    expect(screen.getByText('Isi Sheet')).toBeTruthy();
    expect(screen.getByText('Judul Header')).toBeTruthy();
    expect(screen.getByText('Footer Aksi')).toBeTruthy();
  });
});
