export interface WorkerReadinessPayload {
  service: "neargather-worker";
  status: "ready";
  version: string;
}

export function workerReadinessPayload(version = "0.1.0"): WorkerReadinessPayload {
  return {
    service: "neargather-worker",
    status: "ready",
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
