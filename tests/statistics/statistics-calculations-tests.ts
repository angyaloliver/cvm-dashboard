import { calculateTendency } from '../../src/scripts/statistics/statistics-calculations';

describe('math', () => {
  it('tendency', () => {
    const values = new Array<[number, number]>([2000, 0.8], [3000, 0.4]);
    const result = calculateTendency(values);
    expect(result).toBeCloseTo(-0.4);
  });
});
qq