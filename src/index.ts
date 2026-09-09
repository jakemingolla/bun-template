import { log } from "./logger.ts";

export function handleRequest(request: Request): Response {
  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return Response.json({ status: "ok" });
  }

  if (url.pathname === "/") {
    return Response.json({ service: "bun-template" });
  }

  return new Response("Not Found", { status: 404 });
}

export function start(options?: { port?: number; hostname?: string }) {
  const port = options?.port ?? Number(process.env.PORT ?? 3000);
  const hostname = options?.hostname ?? process.env.HOSTNAME ?? "0.0.0.0";

  const server = Bun.serve({
    port,
    hostname,
    fetch: handleRequest,
  });

  log("info", "server started", {
    port: server.port,
    hostname: server.hostname,
  });

  return server;
}

if (import.meta.main) {
  const server = start();

  const shutdown = (signal: string) => {
    log("info", "shutting down", { signal });
    void server.stop().then(() => {
      process.exit(0);
    });
  };

  process.once("SIGTERM", () => {
    shutdown("SIGTERM");
  });
  process.once("SIGINT", () => {
    shutdown("SIGINT");
  });
}
