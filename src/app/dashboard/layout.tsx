"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  Megaphone,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Календарь", icon: Calendar },
  { href: "/dashboard/clients", label: "Клиенты", icon: Users },
  { href: "/dashboard/services", label: "Услуги", icon: Sparkles },
  { href: "/dashboard/promotion", label: "Продвижение", icon: Megaphone },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-300 lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="font-heading text-sm font-semibold">CRM</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground lg:hidden"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isExact = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isExact
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar size="sm">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{user?.name || "Косметолог"}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email || ""}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-2 flex gap-1">
              <Button variant="ghost" size="icon-sm" className="flex-1">
                <Settings className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="flex-1">
                <Bell className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => logout()} className="flex-1">
                <LogOut className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-sm font-semibold">CRM Панель</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
