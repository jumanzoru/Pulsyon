import type { Incident, Service, Event } from "@/lib/data";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001";
}

async function apiGetJson<T>(path: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} for ${path}${text ? `: ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export async function getMetricsOverview(window: "15m" | "1h" | "6h" | "24h" = "1h") {
  return apiGetJson<{ asOf: string; services: Service[] }>(
    `/metrics/overview?window=${encodeURIComponent(window)}`,
  );
}

export async function getEvents(params: {
  service?: string;
  statusClass?: "all" | "2xx" | "4xx" | "5xx";
  window?: "15m" | "1h" | "6h" | "24h";
  limit?: number;
  cursor?: string | null;
}) {
  const search = new URLSearchParams();
  search.set("service", params.service ?? "all");
  search.set("statusClass", params.statusClass ?? "all");
  search.set("window", params.window ?? "1h");
  if (params.limit) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);

  return apiGetJson<{ items: Event[]; nextCursor: string | null }>(
    `/events?${search.toString()}`,
  );
}

export async function getIncidents(params: {
  service?: string;
  resolved?: "all" | "true" | "false";
  limit?: number;
  cursor?: string | null;
}) {
  const search = new URLSearchParams();
  search.set("service", params.service ?? "all");
  search.set("resolved", params.resolved ?? "all");
  if (params.limit) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);

  return apiGetJson<{ items: Incident[]; nextCursor: string | null }>(
    `/incidents?${search.toString()}`,
  );
}

export async function getIncidentById(id: string) {
  return apiGetJson<{ incident: Incident }>(`/incidents/${encodeURIComponent(id)}`);
}

