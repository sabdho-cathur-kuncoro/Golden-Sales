import { render } from '@testing-library/react-native';
import FocusAwareStatusBar from './FocusAwareStatusBar';

// useIsFocused is globally mocked to return true (jest.setup.js), so the
// StatusBar is mounted. StatusBar itself renders no host output, so we assert
// that rendering succeeds rather than on visible text.
describe('FocusAwareStatusBar', () => {
  it('renders while focused without crashing', async () => {
    const r = await render(<FocusAwareStatusBar barStyle="dark-content" />);
    // StatusBar produces no host node; a null tree is the expected output.
    expect(r.toJSON()).toBeNull();
  });
});
