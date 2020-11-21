import { Person } from '../person/person';

export const calculateCurrentGlobalCvm = (people: Array<Person>) => {
  return people.reduce((p, c) => p + c.cvm, 0) / people.length;
};

export const calculateDailyAverageCvm = (cvmValues: Array<number>) => {
  return cvmValues.reduce((p, c) => p + c, 0) / cvmValues.length;
};

export const calculateTendency = (cvmValues: Array<number>): number => {
  const n = cvmValues.length;
  const y = cvmValues.reduce((p, c) => p + c, 0);
  const yAvg = y / n;
  const tAvg = (n + 1) / 2;
  const ty = cvmValues.reduce((p, c, i) => p + c * (i + 1), 0);
  const tt = cvmValues.reduce((p, _, i) => p + (i + 1) ** 2, 0);
  return (8 * (ty / n - tAvg * yAvg)) / (tt / n - tAvg ** 2);
};
