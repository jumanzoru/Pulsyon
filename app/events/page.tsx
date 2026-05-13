"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { Event } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEvents } from "@/lib/api";

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
  const [items, setItems] = useState<Event[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusClass = useMemo<"all" | "2xx" | "4xx" | "5xx">(() => {
    if (statusFilter === "2") return "2xx";
    if (statusFilter === "4") return "4xx";
    if (statusFilter === "5") return "5xx";
    return "all";
  }, [statusFilter]);

  useEffect(() => {
    // Reset pagination whenever filters change.
    setCursor(null);
    setCursorStack([]);
  }, [serviceFilter, statusClass, timeRange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getEvents({
      service: serviceFilter,
      statusClass,
      window: timeRange as "15m" | "1h" | "6h" | "24h",
      limit: ITEMS_PER_PAGE,
      cursor,
    })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setNextCursor(data.nextCursor);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load events");
        setItems([]);
        setNextCursor(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceFilter, statusClass, timeRange, cursor]);

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
        {error && (
          <div className="p-4 border-b border-[#1F2937] text-sm text-[#F59E0B]">
            {error}
          </div>
        )}
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
              {items.map((event) => (
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
              {!loading && items.length === 0 && (
                <TableRow className="border-[#1F2937] hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-sm text-[#9CA3AF] p-8">
                    No events found
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow className="border-[#1F2937] hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-sm text-[#9CA3AF] p-8">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[#1F2937]">
          <div className="text-sm text-[#9CA3AF]">
            Showing {items.length} event{items.length === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCursorStack((prev) => {
                  const next = prev.slice(0, -1);
                  const previousCursor = prev[prev.length - 1] ?? null;
                  setCursor(previousCursor);
                  return next;
                });
              }}
              disabled={cursorStack.length === 0 || loading}
              className="bg-[#0B0F14] border-[#1F2937] hover:bg-white/5 disabled:opacity-50 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!nextCursor) return;
                setCursorStack((prev) => [...prev, cursor ?? ""]);
                setCursor(nextCursor);
              }}
              disabled={!nextCursor || loading}
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
