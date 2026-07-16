import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Faq from './index';

const Q_MINTA = 'Bagaimana cara minta barang ke gudang?';
const Q_SCAN = 'Bagaimana cara menjual stok lewat menu Scan?';
const Q_VOUCHER = 'Kenapa kode voucher/serial number tidak terlihat?';
const A_MINTA = /telusuri stok per kategori/;
const A_SCAN = /arahkan kamera ke barcode/;

const type = async (text: string) =>
  act(async () => {
    fireEvent.changeText(
      screen.getByPlaceholderText('Cari pertanyaan...'),
      text
    );
  });

const press = async (el: any) =>
  act(async () => {
    fireEvent.press(el);
  });

// Smoke: FAQ screen with a static list.
describe('FAQ screen', () => {
  it('mounts and shows the hero heading', async () => {
    await render(<Faq />);
    expect(screen.getByText('Ada yang bisa kami bantu?')).toBeTruthy();
  });

  it('lists the current feature questions', async () => {
    await render(<Faq />);
    expect(screen.getByText(Q_MINTA)).toBeTruthy();
    expect(screen.getByText(Q_SCAN)).toBeTruthy();
    expect(
      screen.getByText('Bagaimana cara melihat atau membagikan invoice?')
    ).toBeTruthy();
  });

  it('answers stay hidden until an item is toggled open', async () => {
    await render(<Faq />);
    expect(screen.queryByText(A_MINTA)).toBeNull();

    await press(screen.getByText(Q_MINTA));
    expect(screen.getByText(A_MINTA)).toBeTruthy();

    // toggle same item closed again
    await press(screen.getByText(Q_MINTA));
    expect(screen.queryByText(A_MINTA)).toBeNull();
  });

  it('keeps only one accordion open at a time', async () => {
    await render(<Faq />);
    await press(screen.getByText(Q_MINTA));
    expect(screen.getByText(A_MINTA)).toBeTruthy();

    await press(screen.getByText(Q_SCAN));
    expect(screen.getByText(A_SCAN)).toBeTruthy();
    expect(screen.queryByText(A_MINTA)).toBeNull();
  });

  it('filters questions by search query (question and answer text)', async () => {
    await render(<Faq />);
    await type('voucher');
    expect(screen.getByText(Q_VOUCHER)).toBeTruthy();
    expect(screen.queryByText(Q_MINTA)).toBeNull();

    // matches answer body too ("gudang" is in the minta-barang answer)
    await type('ajukan permintaan ke gudang');
    expect(screen.getByText(Q_MINTA)).toBeTruthy();
  });

  it('shows the empty state for an unknown query and restores on clear', async () => {
    await render(<Faq />);
    await type('zzz-tidak-ada');
    expect(screen.getByText('Tidak ditemukan')).toBeTruthy();
    expect(screen.queryByText(Q_MINTA)).toBeNull();

    // X button clears the query and brings the full list back
    await press(screen.getByLabelText('Hapus pencarian'));
    expect(screen.getByText(Q_MINTA)).toBeTruthy();
  });
});
