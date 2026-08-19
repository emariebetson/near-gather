import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { healthPayload } from "./health.js";

export interface HttpRouteResult {
  body: string;
  statusCode: 200 | 404;
}

export function routeHealthRequest(pathname: string): HttpRouteResult {
  if (pathname === "/api/health") {
    return {
      body: JSON.stringify(healthPayload()),
      statusCode: 200
    };
  }

  return { body: "Not found", statusCode: 404 };
}

export function createWebServer() {
  return createServer((request: IncomingMessage, response: ServerResponse) => {
    const result = routeHealthRequest(request.url?.split("?", 1)[0] ?? "/");
    response.statusCode = result.statusCode;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(result.body);
  });
}

export function startWebServer(port = Number(process.env.PORT ?? 3000)) {
  const server = createWebServer();
  server.listen(port);
  return server;
}

if (process.env.NEARGATHER_START_SERVER === "1") {
  startWebServer();
}
