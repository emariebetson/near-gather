import { describe, expect, it } from "vitest";

import { healthPayload } from "./health";

describe("web health payload", () => {
  it("returns a stable liveness response without secrets or tenant data", () => {
    expect(healthPayload()).toEqual({
      service: "neargather-web",
      status: "ok",
      version: "0.1.0"
    });
  });
});
