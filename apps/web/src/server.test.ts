import { describe, expect, it } from "vitest";

import { routeHealthRequest } from "./server";

describe("web runtime health route", () => {
  it("returns JSON health only for /api/health", () => {
    expect(routeHealthRequest("/api/health")).toEqual({
      body: JSON.stringify({
        service: "neargather-web",
        status: "ok",
        version: "0.1.0"
      }),
      statusCode: 200
    });

    expect(routeHealthRequest("/private")).toEqual({
      body: "Not found",
      statusCode: 404
    });

    expect(routeHealthRequest("/api/ready").statusCode).toBe(503);
  });
});
