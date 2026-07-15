// helper.ts imports `router` from expo-router at module scope; the functions
// under test don't use it, so a bare stub keeps the import from pulling native.
jest.mock('expo-router', () => ({ router: {} }));

import { getInitials, imgSrc, generateChat } from './helper';

describe('getInitials', () => {
  it('empty for missing/blank name', () => {
    expect(getInitials()).toBe('');
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });
  it('one word → first two letters upper', () => {
    expect(getInitials('budi')).toBe('BU');
    expect(getInitials('A')).toBe('A');
  });
  it('two+ words → first letter of first two words', () => {
    expect(getInitials('budi santoso')).toBe('BS');
    expect(getInitials('agus dwi prakoso')).toBe('AD');
  });
  it('collapses extra whitespace', () => {
    expect(getInitials('  budi   santoso ')).toBe('BS');
  });
});

describe('imgSrc', () => {
  it('empty string when no base64', () => {
    expect(imgSrc(null)).toBe('');
    expect(imgSrc({})).toBe('');
  });
  it('builds a data URI with provided content type', () => {
    expect(imgSrc({ imageBase64: 'AAAA', imageContentType: 'image/jpeg' })).toBe(
      'data:image/jpeg;base64,AAAA'
    );
  });
  it('defaults content type to image/png', () => {
    expect(imgSrc({ imageBase64: 'AAAA' })).toBe('data:image/png;base64,AAAA');
  });
});

describe('generateChat', () => {
  it('groups by day (desc) with a day separator, messages desc within a day', () => {
    const messages = [
      { id: 1, created_at: '2024-01-01T08:00:00Z', text: 'old-morning' },
      { id: 2, created_at: '2024-01-01T10:00:00Z', text: 'old-later' },
      { id: 3, created_at: '2024-01-03T09:00:00Z', text: 'new' },
    ];
    const out = generateChat(messages);

    // day separators, newest day first
    const days = out.filter((x: any) => x.type === 'day').map((x: any) => x.date);
    expect(days).toEqual(['03 January 2024', '01 January 2024']);

    // separator carries date as id
    const firstDay = out.find((x: any) => x.type === 'day');
    expect(firstDay.id).toBe(firstDay.date);

    // within 01 January, later message comes before earlier
    const jan1 = out.filter((x: any) => x.type !== 'day' && x.id !== 3);
    expect(jan1.map((m: any) => m.id)).toEqual([2, 1]);
  });
});
