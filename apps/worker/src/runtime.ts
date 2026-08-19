export interface WorkerReadinessPayload {
  service: "neargather-worker";
  status: "ready" | "not_ready";
  version: string;
  checks: {
    database: "configured" | "missing";
  };
}

export function workerReadinessPayload(
  env: NodeJS.ProcessEnv = process.env,
  version = "0.1.0"
): WorkerReadinessPayload {
  const database = env.DATABASE_URL ? "configured" : "missing";
  return {
    checks: { database },
    service: "neargather-worker",
    status: database === "configured" ? "ready" : "not_ready",
    version
  };
}

export function startWorkerProcess(): void {
  const payload = workerReadinessPayload();
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

if (process.env.NEARGATHER_START_WORKER === "1") {
  startWorkerProcess();
}
