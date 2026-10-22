import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { isValidCourseCredits, parseCourseCredits, toCourseCredits } from "../course-credits";

describe("course credits", () => {
  it("keeps a fractional value instead of truncating it", () => {
    expect(parseCourseCredits("22.5")).toBe(22.5);
    expect(parseCourseCredits(22.5)).toBe(22.5);
    expect(parseCourseCredits("33.75")).toBe(33.75);
  });

  it("keeps a whole value", () => {
    expect(parseCourseCredits("180")).toBe(180);
    expect(parseCourseCredits(180)).toBe(180);
    expect(parseCourseCredits("120.00")).toBe(120);
  });

  it("rejects negatives and garbage", () => {
    expect(parseCourseCredits("-5")).toBe(0);
    expect(parseCourseCredits("abc")).toBe(0);
    expect(parseCourseCredits("")).toBe(0);
    expect(parseCourseCredits(null)).toBe(0);
    expect(parseCourseCredits(undefined)).toBe(0);
  });

  it("rounds to the two decimal places the column holds", () => {
    expect(parseCourseCredits("22.567")).toBe(22.57);
    expect(parseCourseCredits("22.564")).toBe(22.56);
  });

  it("converts a stored decimal into a plain number", () => {
    expect(toCourseCredits(new Prisma.Decimal("22.50"))).toBe(22.5);
    expect(typeof toCourseCredits(new Prisma.Decimal("22.50"))).toBe("number");
    expect(toCourseCredits(180)).toBe(180);
    expect(toCourseCredits("22.5")).toBe(22.5);
    expect(toCourseCredits(null)).toBe(0);
    expect(toCourseCredits(undefined)).toBe(0);
    expect(toCourseCredits(Number.NaN)).toBe(0);
  });

  it("validates user input", () => {
    expect(isValidCourseCredits("22.5")).toBe(true);
    expect(isValidCourseCredits("0")).toBe(true);
    expect(isValidCourseCredits("")).toBe(false);
    expect(isValidCourseCredits("-1")).toBe(false);
    expect(isValidCourseCredits("abc")).toBe(false);
    expect(isValidCourseCredits(null)).toBe(false);
  });
});
