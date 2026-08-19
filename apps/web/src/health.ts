export interface HealthPayload {
  service: "neargather-web";
  status: "ok";
  version: string;
}

export function healthPayload(version = "0.1.0"): HealthPayload {
  return {
    service: "neargather-web",
    status: "ok",
    version
  };
}
