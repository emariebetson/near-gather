import { describe, expect, it } from "vitest";

import { healthPayload, readinessPayload } from "./health";

describe("web health payload", () => {
  it("returns a stable liveness response without secrets or tenant data", () => {
    expect(healthPayload()).toEqual({
      service: "neargather-web",
      status: "ok",
      version: "0.1.0"
    });
  });
});

describe("readiness payload", () => {
  it("stays not ready until the canonical database is configured", () => {
    expect(readinessPayload({})).toMatchObject({
      status: "not_ready",
      checks: { database: "missing" }
    });
    expect(readinessPayload({ DATABASE_URL: "postgres://configured" })).toMatchObject({
      status: "ready",
      checks: { database: "configured" }
    });
  });
});
