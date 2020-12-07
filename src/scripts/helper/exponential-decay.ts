export const exponentialDecay = (
  oldValue: number,
  newValue: number,
  decayFactor: number
): number =>
  (oldValue * (decayFactor - 1)) / decayFactor + (newValue * 1) / decayFactor;
