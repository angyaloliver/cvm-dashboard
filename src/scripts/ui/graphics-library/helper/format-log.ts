/**
 * @internal
 */
export const formatLog = (originator: string, message: any): string => {
  return `[GL][${originator}]: ${message as string}`;
};
