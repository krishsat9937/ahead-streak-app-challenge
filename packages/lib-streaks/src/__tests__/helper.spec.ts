import { getLastCompletedDateBefore } from '../helper';

test('getLastCompletedDateBefore finds nearest completed', () => {
  const map = new Map([
    ['2024-02-20', 0],
    ['2024-02-21', 2],
    ['2024-02-22', 0],
  ]);
  expect(getLastCompletedDateBefore('2024-02-23', map, 'UTC')).toBe('2024-02-21');
});
