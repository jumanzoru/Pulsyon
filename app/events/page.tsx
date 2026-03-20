"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { events } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

function getStatusBadge(statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) {
    return (
      <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
        {statusCode}
      </Badge>
    );
  }
  if (statusCode >= 400 && statusCode < 500) {
    return (
      <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
        {statusCode}
      </Badge>
    );
  }
  if (statusCode >= 500) {
    return (
      <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
        {statusCode}
      </Badge>
    );
  }
  return (
    <Badge className="bg-white/5 text-[#9CA3AF] border-[#1F2937]">{statusCode}</Badge>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function EventExplorer() {
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (serviceFilter !== "all" && event.service !== serviceFilter) return false;
      if (statusFilter !== "all") {
        const statusCode = parseInt(statusFilter);
        if (statusCode === 2 && !(event.statusCode >= 200 && event.statusCode < 300))
          return false;
        if (statusCode === 4 && !(event.statusCode >= 400 && event.statusCode < 500))
          return false;
        if (statusCode === 5 && event.statusCode < 500) return false;
      }
      return true;
    });
  }, [serviceFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-2">Event Explorer</h1>
        <p className="text-[#9CA3AF]">Search and analyze system events and logs</p>
      </div>

      <Card className="bg-[#111827] border-[#1F2937] p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[#9CA3AF] mb-2 block">Service</label>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="bg-[#0B0F14] border-[#1F2937] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-[#1F2937]">
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[#9CA3AF] mb-2 block">Status Code</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0B0F14] border-[#1F2937] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-[#1F2937]">
                <SelectItem value="all">All Status Codes</SelectItem>
                <SelectItem value="2">2xx Success</SelectItem>
                <SelectItem value="4">4xx Client Error</SelectItem>
                <SelectItem value="5">5xx Server Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[#9CA3AF] mb-2 block">Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-[#0B0F14] border-[#1F2937] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-[#1F2937]">
                <SelectItem value="15m">Last 15 minutes</SelectItem>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-[#111827] border-[#1F2937]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1F2937] hover:bg-transparent">
                <TableHead className="text-[#9CA3AF]">Timestamp</TableHead>
                <TableHead className="text-[#9CA3AF]">Service</TableHead>
                <TableHead className="text-[#9CA3AF]">Endpoint</TableHead>
                <TableHead className="text-[#9CA3AF]">Status</TableHead>
                <TableHead className="text-[#9CA3AF] text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.map((event) => (
                <TableRow key={event.id} className="border-[#1F2937] hover:bg-white/5">
                  <TableCell className="font-mono text-sm text-[#9CA3AF]">
                    {formatTimestamp(event.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#1F2937] text-[#E5E7EB]">
                      {event.service}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-white">
                    {event.endpoint}
                  </TableCell>
                  <TableCell>{getStatusBadge(event.statusCode)}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-white">
                    {event.latency}ms
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[#1F2937]">
          <div className="text-sm text-[#9CA3AF]">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of{" "}
            {filteredEvents.length} events
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-[#0B0F14] border-[#1F2937] hover:bg-white/5 disabled:opacity-50 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="text-sm text-[#9CA3AF]">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-[#0B0F14] border-[#1F2937] hover:bg-white/5 disabled:opacity-50 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
