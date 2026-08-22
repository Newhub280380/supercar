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
  PenLine,
  BarChart3,
  Building2,
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
  { href: "/dashboard/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/dashboard/promotion", label: "Продвижение", icon: Megaphone },
  { href: "/dashboard/content", label: "Контент", icon: PenLine },
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
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    const { error } = await logout();
    setLogoutError(error ?? null);
  };

  const initials = (user?.name || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <div
        className={cn(
          "border-border bg-card fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-300 lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-border flex h-14 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
                <Sparkles className="size-4" />
              </div>
              <span className="font-heading text-sm font-semibold">CRM</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground hidden size-7 items-center justify-center rounded-lg transition-colors lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-muted-foreground flex size-7 items-center justify-center rounded-lg lg:hidden"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col gap-1">
            <a
              href="/office/house/index.html"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
              )}
              title="3D-офис: комнаты — отделы компании"
            >
              <Building2 className="size-4 shrink-0" />
              {!collapsed && <span>3D-офис</span>}
            </a>
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
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

        <div className="border-border border-t p-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center",
            )}
          >
            <Avatar size="sm">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {user?.name || "Косметолог"}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email || ""}
                </span>
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
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          )}
          {!collapsed && logoutError && (
            <p className="text-destructive mt-2 text-xs">{logoutError}</p>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border bg-card flex h-14 items-center border-b px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground hover:bg-muted mr-3 flex size-8 items-center justify-center rounded-lg"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-sm font-semibold">CRM Панель</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
