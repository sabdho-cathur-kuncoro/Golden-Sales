import { render, screen, fireEvent } from '@testing-library/react-native';

// Harness gap: SVGs under `@/assets/*.svg` escape the global svgMock because
// moduleNameMapper's `^@/assets/(.*)$` rule wins over `\.svg$`, resolving to the
// real (untransformable) asset. Stub the three icons TileItem imports (jest.mock
// requires an inline factory, so each is spelled out).
jest.mock('@/assets/icons/ic-timer-sand.svg', () => ({
  __esModule: true,
  default: (p: any) => require('react').createElement('Svg', p),
}));
jest.mock('@/assets/icons/ic-world-sec.svg', () => ({
  __esModule: true,
  default: (p: any) => require('react').createElement('Svg', p),
}));
jest.mock('@/assets/icons/ic-world.svg', () => ({
  __esModule: true,
  default: (p: any) => require('react').createElement('Svg', p),
}));

import TileItem from './TileItem';

describe('TileItem', () => {
  it('renders product name, price and unit', async () => {
    await render(
      <TileItem data={{ name: 'Semen', price: 55000, unit: 'sak' }} onPress={() => {}} />
    );
    expect(screen.getByText('Semen')).toBeTruthy();
    expect(screen.getByText(/55\.000 \/ sak/)).toBeTruthy();
  });

  it('renders product extra info (value + exp) when present', async () => {
    await render(
      <TileItem
        data={{ name: 'Cat', price: 90000, unit: 'kaleng', value: 'Merek A', exp: '2027-01' }}
        onPress={() => {}}
      />
    );
    expect(screen.getByText('Merek A')).toBeTruthy();
    expect(screen.getByText('2027-01')).toBeTruthy();
  });

  it('renders service info value when isService', async () => {
    await render(
      <TileItem
        data={{ name: 'Instalasi', price: 100000, unit: 'unit', value: 'Garansi 1 tahun' }}
        isService
        onPress={() => {}}
      />
    );
    expect(screen.getByText('Garansi 1 tahun')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(
      <TileItem data={{ name: 'Paku', price: 1000, unit: 'kg' }} onPress={onPress} />
    );
    fireEvent.press(screen.getByText('Paku'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
