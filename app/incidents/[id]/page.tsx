import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { incidents } from "@/lib/data";
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, TrendingUp } from "lucide-react";

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">Critical</Badge>;
    case "high":
      return <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">High</Badge>;
    case "medium":
      return <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">Medium</Badge>;
    case "low":
      return <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">Low</Badge>;
    default:
      return <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">{severity}</Badge>;
  }
}

function getAlertLevelBadge(level: string) {
  switch (level) {
    case "critical":
      return <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">Critical</Badge>;
    case "error":
      return <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">Error</Badge>;
    case "warning":
      return <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">Warning</Badge>;
    default:
      return <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">{level}</Badge>;
  }
}

function getIncidentTypeIcon(type: string) {
  switch (type) {
    case "latency_spike":
      return <TrendingUp className="w-6 h-6 text-[#F59E0B]" />;
    case "error_spike":
      return <AlertTriangle className="w-6 h-6 text-[#EF4444]" />;
    default:
      return <AlertTriangle className="w-6 h-6 text-[#9CA3AF]" />;
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
}

export default async function IncidentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = incidents.find((inc) => inc.id === id);

  if (!incident) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl text-white mb-2">Incident Not Found</h2>
          <p className="text-[#9CA3AF] mb-6">The incident you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/incidents">
            <Button
              variant="outline"
              className="bg-[#0B0F14] border-[#1F2937] hover:bg-white/5 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Incidents
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/incidents">
          <Button
            variant="ghost"
            className="mb-4 text-[#9CA3AF] hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Incidents
          </Button>
        </Link>
      </div>

      <Card className="bg-[#111827] border-[#1F2937] p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1">{getIncidentTypeIcon(incident.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl text-white">{formatIncidentType(incident.type)}</h1>
              {getSeverityBadge(incident.severity)}
              {incident.isResolved && (
                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[#9CA3AF] mb-1">Service</div>
                <div className="capitalize text-white">{incident.service}</div>
              </div>
              <div>
                <div className="text-[#9CA3AF] mb-1">Started</div>
                <div className="text-white">{formatTimestamp(incident.startTime)}</div>
              </div>
              <div>
                <div className="text-[#9CA3AF] mb-1">Duration</div>
                <div className="text-white">{formatDuration(incident.duration)}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-[#111827] border-[#1F2937] p-6">
        <h2 className="text-xl text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#9CA3AF]" />
          Alert Timeline
        </h2>
        <div className="space-y-4">
          {incident.alerts.map((alert, index) => (
            <div key={alert.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    alert.level === "critical"
                      ? "bg-[#EF4444]"
                      : alert.level === "error"
                        ? "bg-[#EF4444]"
                        : "bg-[#F59E0B]"
                  }`}
                />
                {index < incident.alerts.length - 1 && (
                  <div
                    className="w-0.5 flex-1 bg-[#1F2937] my-1"
                    style={{ minHeight: "24px" }}
                  />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-[#9CA3AF]">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                  {getAlertLevelBadge(alert.level)}
                </div>
                <p className="text-white">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
