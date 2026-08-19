import { describe, expect, it } from "vitest";

import { workerReadinessPayload } from "./runtime";

describe("worker readiness", () => {
  it("reports a stable worker identity without database or provider secrets", () => {
    expect(workerReadinessPayload({ DATABASE_URL: "postgres://configured" })).toEqual({
      checks: { database: "configured" },
      service: "neargather-worker",
      status: "ready",
      version: "0.1.0"
    });

    expect(workerReadinessPayload({}).status).toBe("not_ready");
  });
});
