import { calculateTendency } from '../../src/scripts/statistics/statistics-calculations';

describe('math', () => {
  it('tendency', () => {
    const values = new Array<number>(0.6, 0.7, 0.8, 0.4);
    const result = calculateTendency(values);
    expect(result).toBeCloseTo(-0.4);
  });
});
