"use client";

import { Calendar, Bell, MessageSquare, Users, FileText, Home } from "lucide-react";
import type { LandingContent } from "@/lib/mom-ai/landing-generator";

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  bell: Bell,
  message: MessageSquare,
  users: Users,
  "file-text": FileText,
  home: Home,
};

interface FeatureGridProps {
  features: LandingContent["features"];
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = iconMap[feature.icon] ?? Home;
        return (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Icon className="size-5" />
            </div>
            <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}
