import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="flex h-screen bg-[#0B0F14] text-[#E5E7EB]">
          <AppSidebar />

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
