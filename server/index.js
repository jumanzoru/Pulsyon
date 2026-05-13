/**
 * Pulsyon API (step 2): backend skeleton.
 *
 * Intentionally dependency-free for now (no Express/Fastify yet).
 * This gives you a real HTTP server + routing so you can iterate safely
 * before adding DB/Redis/queues.
 */

// overview of http protocol , http , what get request is , what post request is , what restapi is
// writing your own http server
// implement a process that listens on a socket & responds to a TCP request
// getting a call - > return json response
// could start with modern framework & peel back the layers

const http = require("node:http");
const { services, events, incidents, failedEvents } = require("./mockData");

const PORT = Number(process.env.PORT || 3001);

function sendJson(res, statusCode, body) {
  const json = JSON.stringify(body);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(json),
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  });
  res.end(json);
}

function sendNoContent(res, statusCode) {
  res.writeHead(statusCode, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  });
  res.end();
}

function notFound(res) {
  sendJson(res, 404, {
    error: { code: "not_found", message: "Route not found", details: {} },
  });
}

function notImplemented(res, routeId) {
  sendJson(res, 501, {
    error: {
      code: "not_implemented",
      message: `Not implemented yet: ${routeId}`,
      details: {},
    },
  });
}

function badRequest(res, message) {
  sendJson(res, 400, {
    error: { code: "bad_request", message, details: {} },
  });
}

function parseLimit(raw, { defaultLimit, maxLimit }) {
  if (raw === null) return defaultLimit;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return defaultLimit;
  return Math.min(Math.floor(n), maxLimit);
}

function parseCursorOffset(raw) {
  if (raw === null) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function paginate(items, { limit, offset }) {
  const slice = items.slice(offset, offset + limit);
  const nextOffset = offset + slice.length;
  return {
    items: slice,
    nextCursor: nextOffset >= items.length ? null : String(nextOffset),
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) return notFound(res);

  if (req.method === "OPTIONS") return sendNoContent(res, 204);

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // Health check (useful for “is the backend up?”)
  if (req.method === "GET" && pathname === "/healthz") {
    return sendJson(res, 200, { ok: true });
  }

  // Step 2 deliverable: routing skeleton matching docs/api-contract.md.
  if (req.method === "GET" && pathname === "/metrics/overview") {
    const window = url.searchParams.get("window") || "1h";
    const allowed = new Set(["15m", "1h", "6h", "24h"]);
    if (!allowed.has(window)) return badRequest(res, "Invalid window");

    return sendJson(res, 200, {
      asOf: new Date().toISOString(),
      services,
    });
  }

  if (req.method === "GET" && pathname === "/events") {
    const service = url.searchParams.get("service") || "all";
    const statusClass = url.searchParams.get("statusClass") || "all";
    const window = url.searchParams.get("window") || "1h";
    const allowedWindow = new Set(["15m", "1h", "6h", "24h"]);
    if (!allowedWindow.has(window)) return badRequest(res, "Invalid window");

    const allowedStatus = new Set(["all", "2xx", "4xx", "5xx"]);
    if (!allowedStatus.has(statusClass)) return badRequest(res, "Invalid statusClass");

    const limit = parseLimit(url.searchParams.get("limit"), {
      defaultLimit: 20,
      maxLimit: 100,
    });
    const offset = parseCursorOffset(url.searchParams.get("cursor"));

    let filtered = events;
    if (service !== "all") filtered = filtered.filter((e) => e.service === service);
    if (statusClass === "2xx") {
      filtered = filtered.filter((e) => e.statusCode >= 200 && e.statusCode < 300);
    } else if (statusClass === "4xx") {
      filtered = filtered.filter((e) => e.statusCode >= 400 && e.statusCode < 500);
    } else if (statusClass === "5xx") {
      filtered = filtered.filter((e) => e.statusCode >= 500);
    }

    const page = paginate(filtered, { limit, offset });
    return sendJson(res, 200, page);
  }

  if (req.method === "GET" && pathname === "/incidents") {
    const service = url.searchParams.get("service") || "all";
    const resolved = url.searchParams.get("resolved") || "all";
    const allowedResolved = new Set(["all", "true", "false"]);
    if (!allowedResolved.has(resolved)) return badRequest(res, "Invalid resolved");

    const limit = parseLimit(url.searchParams.get("limit"), {
      defaultLimit: 50,
      maxLimit: 100,
    });
    const offset = parseCursorOffset(url.searchParams.get("cursor"));

    let filtered = incidents;
    if (service !== "all") filtered = filtered.filter((i) => i.service === service);
    if (resolved === "true") filtered = filtered.filter((i) => i.isResolved);
    if (resolved === "false") filtered = filtered.filter((i) => !i.isResolved);

    const page = paginate(filtered, { limit, offset });
    return sendJson(res, 200, page);
  }

  // GET /incidents/:id
  if (req.method === "GET" && pathname.startsWith("/incidents/")) {
    const id = pathname.slice("/incidents/".length);
    if (id === "summary") {
      // handled below
    } else if (id.length > 0) {
      const incident = incidents.find((inc) => inc.id === id);
      if (!incident) {
        return sendJson(res, 404, {
          error: {
            code: "not_found",
            message: "Incident not found",
            details: { id },
          },
        });
      }
      return sendJson(res, 200, { incident });
    }
  }

  if (req.method === "GET" && pathname === "/incidents/summary") {
    const window = url.searchParams.get("window") || "7d";
    const allowed = new Set(["24h", "7d", "30d"]);
    if (!allowed.has(window)) return badRequest(res, "Invalid window");

    const open = incidents.filter((i) => !i.isResolved);
    const critical = open.filter((i) => i.severity === "critical");
    const resolved = incidents.filter((i) => i.isResolved);
    const mttrMinutes =
      resolved.length === 0
        ? 0
        : Math.round(resolved.reduce((sum, i) => sum + i.duration, 0) / resolved.length);

    const countsByService = incidents.reduce((acc, inc) => {
      acc[inc.service] = (acc[inc.service] || 0) + 1;
      return acc;
    }, {});
    const mostIncidentProneService =
      Object.entries(countsByService).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return sendJson(res, 200, {
      openCount: open.length,
      criticalCount: critical.length,
      mttrMinutes,
      mostIncidentProneService,
    });
  }

  if (req.method === "GET" && pathname === "/admin/failed-events") {
    const service = url.searchParams.get("service") || "all";
    const limit = parseLimit(url.searchParams.get("limit"), {
      defaultLimit: 50,
      maxLimit: 100,
    });
    const offset = parseCursorOffset(url.searchParams.get("cursor"));

    let filtered = failedEvents;
    if (service !== "all") filtered = filtered.filter((e) => e.service === service);

    const page = paginate(filtered, { limit, offset });
    return sendJson(res, 200, page);
  }

  if (req.method === "POST" && pathname === "/ingest") {
    return notImplemented(res, "POST /ingest");
  }

  return notFound(res);
});

server.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[pulsyon-api] server error:", err);
  process.exitCode = 1;
});

// Bind to localhost explicitly (some sandboxed environments block 0.0.0.0).
server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`[pulsyon-api] listening on http://127.0.0.1:${PORT}`);
});
