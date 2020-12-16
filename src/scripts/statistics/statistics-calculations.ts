import { Person } from '../person/person';

export const calculateCurrentGlobalCvm = (people: Array<Person>) => {
  return people.reduce((p, c) => p + c.cvm!, 0) / people.length;
};

export const calculateDailyAverageCvm = (cvmValues: Array<number>) => {
  return cvmValues.reduce((p, c) => p + c, 0) / cvmValues.length;
};

export const calculateTendency = (values: Array<[number, number]>): number => {
  if (values.length < 2) {
    return 0;
  }
  const currentValue = values[values.length - 1];
  const previousValue = values[values.length - 2];
  const diffInSec = (currentValue[0] - previousValue[0]) / 1000;
  return (currentValue[1] - previousValue[1]) / diffInSec;
};
