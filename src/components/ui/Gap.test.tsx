import { render } from '@testing-library/react-native';
import Gap from './Gap';

describe('Gap', () => {
  it('renders a spacer View with the given width/height', async () => {
    const json: any = (await render(<Gap width={10} height={20} />)).toJSON();
    const styles = [].concat(json.props.style).flat().filter(Boolean);
    expect(styles).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 10, height: 20 })])
    );
  });
});
