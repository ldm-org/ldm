import { httpSource, httpsSource } from "./source";

describe("httpSource", () => {
  it("should be defined", () => {
    expect(httpSource).toBeDefined();
  });
});

describe("httpsSource", () => {
  it("should be defined", () => {
    expect(httpsSource).toBeDefined();
  });
});
