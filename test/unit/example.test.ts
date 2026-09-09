import { describe, expect, test } from "bun:test";
import { handleRequest, start } from "../../src/index.ts";

const root = `${import.meta.dir}/../..`;

describe("entrypoint", () => {
  test("GET /health returns ok", async () => {
    const response = handleRequest(new Request("http://localhost/health"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("GET / returns service metadata", async () => {
    const response = handleRequest(new Request("http://localhost/"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ service: "bun-template" });
  });

  test("unknown routes return 404", () => {
    const response = handleRequest(new Request("http://localhost/missing"));

    expect(response.status).toBe(404);
  });

  test("start serves the health endpoint", async () => {
    const server = start({ port: 0, hostname: "127.0.0.1" });

    try {
      const response = await fetch(
        `http://127.0.0.1:${String(server.port)}/health`,
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    } finally {
      await server.stop(true);
    }
  });

  test("process exits cleanly on SIGTERM", async () => {
    const proc = Bun.spawn({
      cmd: ["bun", "run", "src/index.ts"],
      cwd: root,
      env: { ...process.env, PORT: "0", HOSTNAME: "127.0.0.1" },
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      await waitForLog(proc.stdout, '"msg":"server started"', 5_000);
      proc.kill("SIGTERM");
      expect(await proc.exited).toBe(0);
    } finally {
      if (proc.exitCode === null) {
        proc.kill("SIGKILL");
        await proc.exited;
      }
    }
  });
});

async function waitForLog(
  stream: ReadableStream<Uint8Array>,
  substring: string,
  timeoutMs: number,
): Promise<void> {
  const decoder = new TextDecoder();
  let buf = "";
  const reader = stream.getReader();

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`timed out waiting for log: ${substring}\n${buf}`));
    }, timeoutMs);
  });

  const readUntilMatch = async (): Promise<void> => {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        throw new Error(
          `stdout closed before log appeared: ${substring}\n${buf}`,
        );
      }
      if (value === undefined) {
        continue;
      }
      buf += decoder.decode(value, { stream: true });
      if (buf.includes(substring)) {
        return;
      }
    }
  };

  await Promise.race([readUntilMatch(), timeout]);
}
