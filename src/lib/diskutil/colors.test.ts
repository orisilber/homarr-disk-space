import { describe, expect, it } from "vitest";
import { barToneForFreeRatio } from "./colors";

describe("barToneForFreeRatio", () => {
  it("returns green when more than half free", () => {
    expect(barToneForFreeRatio(0.51)).toBe("green");
    expect(barToneForFreeRatio(1)).toBe("green");
  });

  it("returns orange between 20% and 50% free inclusive of 20%", () => {
    expect(barToneForFreeRatio(0.5)).toBe("orange");
    expect(barToneForFreeRatio(0.2)).toBe("orange");
  });

  it("returns red below 20% free", () => {
    expect(barToneForFreeRatio(0.199)).toBe("red");
    expect(barToneForFreeRatio(0)).toBe("red");
  });
});
