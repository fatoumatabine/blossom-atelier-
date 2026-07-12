import http from "node:http";
import { Readable } from "node:stream";

const { default: app } = await import("./dist/server/index.js");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || "8080");

function toWebRequest(req) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req),
    duplex: "half",
  });
}

http
  .createServer(async (req, res) => {
    try {
      const response = await app.fetch(toWebRequest(req));

      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (!response.body) {
        res.end();
        return;
      }

      Readable.fromWeb(response.body).pipe(res);
    } catch (error) {
      console.error("Unhandled server error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  })
  .listen(port, host, () => {
    console.log(`Blossom Atelier listening on http://${host}:${port}`);
  });
