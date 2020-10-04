import { Sum } from "../src/sum";

describe("calculate", function () {
  it("Sum", function () {
    let result = Sum(5, 2);
    expect(result).toBe(7);
  });
});
