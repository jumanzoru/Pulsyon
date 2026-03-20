export type ServiceStatus = "healthy" | "degraded" | "down";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
  p95Latency: number;
  errorRate: number;
  requestCount: number;
}

export interface Event {
  id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  statusCode: number;
  latency: number;
}

export interface Incident {
  id: string;
  service: string;
  type: "latency_spike" | "error_spike";
  severity: "low" | "medium" | "high" | "critical";
  startTime: string;
  duration: number;
  isResolved: boolean;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  timestamp: string;
  message: string;
  level: "warning" | "error" | "critical";
}

export const services: Service[] = [
  {
    id: "auth",
    name: "Authentication Service",
    status: "healthy",
    uptime: 99.97,
    p95Latency: 145,
    errorRate: 0.02,
    requestCount: 1547893,
  },
  {
    id: "payments",
    name: "Payment Service",
    status: "degraded",
    uptime: 99.12,
    p95Latency: 892,
    errorRate: 1.24,
    requestCount: 234567,
  },
  {
    id: "inventory",
    name: "Inventory Service",
    status: "healthy",
    uptime: 99.99,
    p95Latency: 87,
    errorRate: 0.01,
    requestCount: 3421890,
  },
  {
    id: "orders",
    name: "Order Service",
    status: "healthy",
    uptime: 99.89,
    p95Latency: 234,
    errorRate: 0.15,
    requestCount: 892341,
  },
];

export const events: Event[] = Array.from({ length: 150 }, (_, i) => {
  const services = ["auth", "payments", "inventory", "orders"];
  const endpoints = [
    "/api/v1/login",
    "/api/v1/verify",
    "/api/v1/checkout",
    "/api/v1/process",
    "/api/v1/stock",
    "/api/v1/items",
    "/api/v1/create",
    "/api/v1/update",
  ];
  const statusCodes = [200, 200, 200, 200, 201, 400, 404, 500, 503];

  const baseTime = Date.parse("2026-03-20T12:00:00.000Z");
  const date = new Date(baseTime - i * 2 * 60 * 1000);

  const pickIndex = (mod: number) => (i * 37 + 11) % mod;

  return {
    id: `event-${i}`,
    timestamp: date.toISOString(),
    service: services[pickIndex(services.length)],
    endpoint: endpoints[pickIndex(endpoints.length)],
    statusCode: statusCodes[pickIndex(statusCodes.length)],
    latency: 50 + ((i * 113) % 1000),
  };
});

export const incidents: Incident[] = [
  {
    id: "inc-001",
    service: "payments",
    type: "latency_spike",
    severity: "high",
    startTime: "2026-03-20T08:23:00Z",
    duration: 47,
    isResolved: false,
    alerts: [
      {
        id: "alert-001",
        timestamp: "2026-03-20T08:23:00Z",
        message: "P95 latency exceeded 800ms threshold",
        level: "warning",
      },
      {
        id: "alert-002",
        timestamp: "2026-03-20T08:35:00Z",
        message: "P95 latency exceeded 1200ms threshold",
        level: "error",
      },
      {
        id: "alert-003",
        timestamp: "2026-03-20T08:50:00Z",
        message: "Service degradation detected - multiple timeout errors",
        level: "critical",
      },
    ],
  },
  {
    id: "inc-002",
    service: "auth",
    type: "error_spike",
    severity: "medium",
    startTime: "2026-03-19T14:15:00Z",
    duration: 23,
    isResolved: true,
    alerts: [
      {
        id: "alert-004",
        timestamp: "2026-03-19T14:15:00Z",
        message: "Error rate exceeded 1% threshold",
        level: "warning",
      },
      {
        id: "alert-005",
        timestamp: "2026-03-19T14:20:00Z",
        message: "Error rate exceeded 2% threshold",
        level: "error",
      },
    ],
  },
  {
    id: "inc-003",
    service: "inventory",
    type: "latency_spike",
    severity: "low",
    startTime: "2026-03-18T22:00:00Z",
    duration: 12,
    isResolved: true,
    alerts: [
      {
        id: "alert-006",
        timestamp: "2026-03-18T22:00:00Z",
        message: "P95 latency exceeded 150ms threshold",
        level: "warning",
      },
    ],
  },
  {
    id: "inc-004",
    service: "orders",
    type: "error_spike",
    severity: "critical",
    startTime: "2026-03-17T03:45:00Z",
    duration: 156,
    isResolved: true,
    alerts: [
      {
        id: "alert-007",
        timestamp: "2026-03-17T03:45:00Z",
        message: "Database connection pool exhausted",
        level: "critical",
      },
      {
        id: "alert-008",
        timestamp: "2026-03-17T04:12:00Z",
        message: "Error rate exceeded 15% threshold",
        level: "critical",
      },
      {
        id: "alert-009",
        timestamp: "2026-03-17T05:30:00Z",
        message: "Service partially recovered - error rate at 5%",
        level: "warning",
      },
    ],
  },
  {
    id: "inc-005",
    service: "payments",
    type: "error_spike",
    severity: "medium",
    startTime: "2026-03-16T11:20:00Z",
    duration: 34,
    isResolved: true,
    alerts: [
      {
        id: "alert-010",
        timestamp: "2026-03-16T11:20:00Z",
        message: "Third-party payment gateway timeout",
        level: "error",
      },
    ],
  },
];
