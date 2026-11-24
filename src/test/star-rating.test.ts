import { describe, expect, it } from "vitest";
import { starFillFractions } from "@/components/sales/StarRating";

describe("StarRating", () => {
  it("fills 4.9 as four full stars and 90% of the last", () => {
    expect(starFillFractions(4.9)).toEqual([1, 1, 1, 1, 0.9]);
  });
});
