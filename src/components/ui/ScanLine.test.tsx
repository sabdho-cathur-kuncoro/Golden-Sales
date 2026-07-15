import { render } from '@testing-library/react-native';
import ScanLine from './ScanLine';

describe('ScanLine', () => {
  it('renders the animated scan line without crashing', async () => {
    const { toJSON } = await render(<ScanLine />);
    expect(toJSON()).toBeTruthy();
  });
});
