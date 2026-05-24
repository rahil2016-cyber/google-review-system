"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { href: string; label: string };

type DashboardSidebarProps = {
  title: string;
  subtitle: string;
  items: NavItem[];
};

export function DashboardSidebar({ title, subtitle, items }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-amber-200/10 bg-zinc-950/80 p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-amber-400/80">Review Funnel</p>
        <h1 className="text-lg font-bold text-amber-100">{title}</h1>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <nav className="flex flex-1 flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
                active
                  ? "gold-gradient font-semibold text-zinc-900"
                  : "text-zinc-300 hover:bg-amber-300/10 hover:text-amber-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
      >
        Sign out
      </button>
    </aside>
  );
}
