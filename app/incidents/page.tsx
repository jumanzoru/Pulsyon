import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { getIncidents } from "@/lib/api";
import type { Incident } from "@/lib/data";

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return (
        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
          Critical
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
          Medium
        </Badge>
      );
    case "low":
      return <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">Low</Badge>;
    default:
      return (
        <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">
          {severity}
        </Badge>
      );
  }
}

function getIncidentTypeIcon(type: string) {
  switch (type) {
    case "latency_spike":
      return <TrendingUp className="w-5 h-5 text-[#F59E0B]" />;
    case "error_spike":
      return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-[#9CA3AF]" />;
  }
}

function formatIncidentType(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default async function Incidents() {
  let incidents: Incident[] = [];
  try {
    incidents = (await getIncidents({ limit: 100, service: "all", resolved: "all" })).items;
  } catch {
    incidents = [];
  }

  const groupedIncidents = incidents.reduce(
    (acc, incident) => {
      if (!acc[incident.service]) {
        acc[incident.service] = [];
      }
      acc[incident.service].push(incident);
      return acc;
    },
    {} as Record<string, Incident[]>,
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-2">Incidents</h1>
        <p className="text-[#9CA3AF]">Track and investigate service incidents</p>
      </div>

      <div className="space-y-8">
        {incidents.length === 0 && (
          <div className="text-sm text-[#9CA3AF]">Unable to load incidents.</div>
        )}
        {Object.entries(groupedIncidents).map(([service, serviceIncidents]) => (
          <div key={service}>
            <h2 className="text-xl text-white mb-4 capitalize">{service} Service</h2>
            <div className="space-y-3">
              {serviceIncidents.map((incident) => (
                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                  <Card className="bg-[#111827] border-[#1F2937] p-6 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getIncidentTypeIcon(incident.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg text-white">
                              {formatIncidentType(incident.type)}
                            </h3>
                            {getSeverityBadge(incident.severity)}
                            {incident.isResolved && (
                              <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-[#9CA3AF]">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Started {formatTimestamp(incident.startTime)}</span>
                            </div>
                            <div>Duration: {formatDuration(incident.duration)}</div>
                            <div>{incident.alerts.length} alerts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
