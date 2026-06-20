"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Mail,
  MessageSquare,
  Link2,
  Target,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROMOTION_NAV = [
  { href: "/dashboard/promotion", label: "Обзор", icon: BarChart3 },
  { href: "/dashboard/promotion/seo", label: "SEO", icon: Search },
  { href: "/dashboard/promotion/emails", label: "Email", icon: Mail },
  { href: "/dashboard/promotion/sms", label: "SMS", icon: MessageSquare },
  { href: "/dashboard/promotion/utm", label: "UTM", icon: Link2 },
  { href: "/dashboard/promotion/conversions", label: "Конверсии", icon: Target },
];

export default function PromotionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Дашборд
        </Link>
        <h1 className="font-heading text-2xl font-bold">Продвижение</h1>
        <p className="text-sm text-muted-foreground">
          SEO, рассылки, UTM-трекинг и аналитика конверсий
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-border/50 bg-card p-1.5">
        {PROMOTION_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/promotion" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
