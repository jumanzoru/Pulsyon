"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, FileText } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col">
      <div className="p-6 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#9CA3AF]" />
          <span className="text-xl font-semibold text-white">Pulsyon</span>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1">Observability Platform</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/") && pathname === "/"
                  ? "bg-white/10 text-white"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#E5E7EB]"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Services</span>
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/events")
                  ? "bg-white/10 text-white"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#E5E7EB]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Event Explorer</span>
            </Link>
          </li>
          <li>
            <Link
              href="/incidents"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive("/incidents")
                  ? "bg-white/10 text-white"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#E5E7EB]"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Incidents</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-[#1F2937] text-xs text-[#9CA3AF]">
        <div className="flex items-center justify-between">
          <span>System Status</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
            <span className="text-[#22C55E]">Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
