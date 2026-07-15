import { useBottomSheetStore } from './bottomSheet.store';

const reset = () =>
  useBottomSheetStore.setState({
    isOpen: false,
    header: null,
    content: null,
    footer: null,
    snapPoints: ['50%'],
  });

beforeEach(reset);

describe('open', () => {
  it('opens with content and default snapPoints', () => {
    useBottomSheetStore.getState().open('body');
    const s = useBottomSheetStore.getState();
    expect(s.isOpen).toBe(true);
    expect(s.content).toBe('body');
    expect(s.snapPoints).toEqual(['50%']);
    expect(s.header).toBeNull();
    expect(s.footer).toBeNull();
  });

  it('accepts custom snapPoints, header and footer', () => {
    useBottomSheetStore
      .getState()
      .open('body', ['25%', '90%'], 'head', 'foot');
    const s = useBottomSheetStore.getState();
    expect(s.snapPoints).toEqual(['25%', '90%']);
    expect(s.header).toBe('head');
    expect(s.footer).toBe('foot');
  });
});

describe('close', () => {
  it('clears content/header/footer and marks closed', () => {
    useBottomSheetStore.getState().open('body', ['90%'], 'head', 'foot');
    useBottomSheetStore.getState().close();
    const s = useBottomSheetStore.getState();
    expect(s.isOpen).toBe(false);
    expect(s.content).toBeNull();
    expect(s.header).toBeNull();
    expect(s.footer).toBeNull();
  });
});
