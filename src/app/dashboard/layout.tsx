import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/feedback", label: "Feedback" },
  { href: "/dashboard/qr", label: "QR Code" },
  { href: "/dashboard/analytics", label: "Analytics" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar title="Business" subtitle="Your review funnel" items={nav} />
      <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
    </div>
  );
}
