export interface HealthPayload {
  service: "neargather-web";
  status: "ok";
  version: string;
}

export interface ReadinessPayload {
  service: "neargather-web";
  status: "ready" | "not_ready";
  version: string;
  checks: {
    database: "configured" | "missing";
  };
}

export function healthPayload(version = "0.1.0"): HealthPayload {
  return {
    service: "neargather-web",
    status: "ok",
    version
  };
}

export function readinessPayload(
  env: NodeJS.ProcessEnv = process.env,
  version = "0.1.0"
): ReadinessPayload {
  const database = env.DATABASE_URL ? "configured" : "missing";
  return {
    checks: { database },
    service: "neargather-web",
    status: database === "configured" ? "ready" : "not_ready",
    version
  };
}
