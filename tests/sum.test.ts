import { Sum } from "../src/sum";

describe("calculate", function () {
  it("Sum", function () {
    const result = Sum(5, 2);
    expect(result).toBe(7);
  });
});
