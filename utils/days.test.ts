import { formatDate, formatDateTime, formatTime, toLocal, fromNow } from './days';

describe('falsy guards', () => {
  it('date formatters return "-" for falsy input', () => {
    expect(formatDate('' as any)).toBe('-');
    expect(formatDate(0 as any)).toBe('-');
    expect(formatDateTime('' as any)).toBe('-');
    expect(formatTime('' as any)).toBe('-');
    expect(fromNow('' as any)).toBe('-');
  });
  it('toLocal returns null for falsy input', () => {
    expect(toLocal('' as any)).toBeNull();
  });
});

describe('formatDate', () => {
  it('formats a date-only string with the default pattern', () => {
    // date-only parse is local midnight → tz-independent for a DD MMMM YYYY format
    expect(formatDate('2024-01-15')).toBe('15 January 2024');
  });
  it('honors a custom format', () => {
    expect(formatDate('2024-01-15', 'YYYY-MM-DD')).toBe('2024-01-15');
  });
});

describe('fromNow (frozen clock)', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it('reports relative time against the frozen now', () => {
    expect(fromNow(new Date('2024-01-01T10:00:00Z'))).toBe('2 hours ago');
  });
});
