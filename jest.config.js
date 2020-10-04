module.exports = {
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "node",
  testRegex: "/tests/.*",
  modulePathIgnorePatterns: ["node_modules"],
  testPathIgnorePatterns: ["node_modules"],
  transformIgnorePatterns: ["node_modules"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
