import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { services, ServiceStatus } from "@/lib/data";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";

function getStatusIcon(status: ServiceStatus) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />;
    case "degraded":
      return <AlertCircle className="w-5 h-5 text-[#F59E0B]" />;
    case "down":
      return <XCircle className="w-5 h-5 text-[#EF4444]" />;
  }
}

function getStatusBadge(status: ServiceStatus) {
  switch (status) {
    case "healthy":
      return (
        <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
          Healthy
        </Badge>
      );
    case "degraded":
      return (
        <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
          Degraded
        </Badge>
      );
    case "down":
      return (
        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
          Down
        </Badge>
      );
  }
}

export default function ServiceOverview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-2">Service Overview</h1>
        <p className="text-[#9CA3AF]">
          Monitor the health and performance of all services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="bg-[#111827] border-[#1F2937] p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(service.status)}</div>
                <div>
                  <h3 className="text-lg text-white mb-1">{service.name}</h3>
                  {getStatusBadge(service.status)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl text-white">{service.uptime}%</div>
                <div className="text-xs text-[#9CA3AF]">Uptime</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#0B0F14] rounded-lg p-4 border border-[#1F2937]">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[#9CA3AF]" />
                  <div className="text-xs text-[#9CA3AF]">P95 Latency</div>
                </div>
                <div className="text-xl text-white">{service.p95Latency}ms</div>
              </div>

              <div className="bg-[#0B0F14] rounded-lg p-4 border border-[#1F2937]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#9CA3AF]" />
                  <div className="text-xs text-[#9CA3AF]">Error Rate</div>
                </div>
                <div className="text-xl text-white">{service.errorRate}%</div>
              </div>

              <div className="bg-[#0B0F14] rounded-lg p-4 border border-[#1F2937]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#9CA3AF]" />
                  <div className="text-xs text-[#9CA3AF]">Requests</div>
                </div>
                <div className="text-xl text-white">
                  {(service.requestCount / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
