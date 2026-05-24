import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

const nav = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/clients", label: "Clients" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar title="Super Admin" subtitle="Platform control" items={nav} />
      <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
    </div>
  );
}
