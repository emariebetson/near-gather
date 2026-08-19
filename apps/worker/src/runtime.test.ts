import { describe, expect, it } from "vitest";

import { workerReadinessPayload } from "./runtime";

describe("worker readiness", () => {
  it("reports a stable worker identity without database or provider secrets", () => {
    expect(workerReadinessPayload()).toEqual({
      service: "neargather-worker",
      status: "ready",
      version: "0.1.0"
    });
  });
});
