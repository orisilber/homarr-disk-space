import { describe, expect, it } from "vitest";
import { bytesToGbString } from "./format-bytes";

describe("bytesToGbString", () => {
  it("converts bytes to GB with fixed decimals", () => {
    expect(bytesToGbString(1024 ** 3)).toBe("1.00");
    expect(bytesToGbString(2.5 * 1024 ** 3, 1)).toBe("2.5");
  });
});
