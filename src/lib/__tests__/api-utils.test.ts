import { describe, it, expect } from "vitest";
import { getPaginationParams, buildSearchFilter, paginatedResponse } from "../api-utils";

describe("API Utils", () => {
  describe("getPaginationParams", () => {
    it("returns defaults when no params", () => {
      const params = getPaginationParams(new URLSearchParams());
      expect(params.page).toBe(1);
      expect(params.perPage).toBe(20);
      expect(params.search).toBe("");
      expect(params.skip).toBe(0);
    });

    it("parses query params correctly", () => {
      const params = getPaginationParams(new URLSearchParams("page=3&perPage=10&search=test"));
      expect(params.page).toBe(3);
      expect(params.perPage).toBe(10);
      expect(params.search).toBe("test");
      expect(params.skip).toBe(20);
    });

    it("enforces max perPage of 100", () => {
      const params = getPaginationParams(new URLSearchParams("perPage=500"));
      expect(params.perPage).toBe(100);
    });

    it("enforces minimum page of 1", () => {
      const params = getPaginationParams(new URLSearchParams("page=0"));
      expect(params.page).toBe(1);
    });
  });

  describe("buildSearchFilter", () => {
    it("returns empty filter for empty search", () => {
      expect(buildSearchFilter("", ["name", "email"])).toEqual({});
    });

    it("builds OR filter for non-empty search", () => {
      const filter = buildSearchFilter("john", ["name", "email"]);
      expect(filter).toHaveProperty("OR");
      expect(filter.OR).toHaveLength(2);
      expect(filter.OR![0]).toEqual({ name: { contains: "john" } });
      expect(filter.OR![1]).toEqual({ email: { contains: "john" } });
    });
  });

  describe("paginatedResponse", () => {
    it("wraps data in pagination envelope", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const params = { page: 1, perPage: 10, search: "", skip: 0 };
      const result = paginatedResponse(data, 25, params);

      expect(result.data).toEqual(data);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(10);
      expect(result.totalPages).toBe(3);
    });
  });
});
