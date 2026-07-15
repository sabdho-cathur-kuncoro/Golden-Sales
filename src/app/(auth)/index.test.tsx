import { render } from '@testing-library/react-native';
import Index from './index';

// Smoke: the (auth) index just renders <Redirect> (mocked to null) — assert it
// mounts without throwing.
describe('(auth) index redirect', () => {
  it('mounts without throwing', async () => {
    const r = await render(<Index />);
    expect(r).toBeTruthy();
  });
});
