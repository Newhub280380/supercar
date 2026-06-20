"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CATEGORY_STYLES: Record<string, string> = {
  fillers: "bg-accent text-accent-foreground border-accent/20",
  peels: "bg-muted text-foreground border-border",
  injectables: "bg-destructive/10 text-destructive border-destructive/20",
  skincare: "bg-secondary text-secondary-foreground border-secondary/20",
  default: "bg-muted/50 text-foreground border-border/50",
};

function getCategoryStyle(category: string | null) {
  if (!category) return CATEGORY_STYLES.default;
  const key = category.toLowerCase().replace(/\s+/g, "");
  return CATEGORY_STYLES[key] ?? CATEGORY_STYLES.default;
}

interface ProcedureCardProps {
  name: string;
  description?: string | null;
  price: string;
  duration: number;
  category?: string | null;
  imageUrl?: string | null;
  onBook?: () => void;
  featured?: boolean;
}

function ProcedureCard({
  name,
  description,
  price,
  duration,
  category = null,
  imageUrl = null,
  onBook,
  featured = false,
}: ProcedureCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        featured
          ? "ring-2 ring-primary/30 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-gold/5 before:to-transparent before:pointer-events-none"
          : ""
      }`}
    >
      <div className="relative h-32 w-full overflow-hidden sm:h-40">
        {imageUrl ? (
          <div className="h-full w-full rounded-t-xl">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-blush via-cream to-accent/30">
            {featured && (
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gold/20" />
            )}
            <Sparkles className="size-8 text-gold/70" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={getCategoryStyle(category) + " backdrop-blur-sm"}
          >
            {category ?? "Other"}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="leading-snug">{name}</CardTitle>
            {description && (
              <CardDescription className="line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-semibold font-heading text-primary">
              {price}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{duration} min</span>
        </div>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          onClick={onBook}
          className="w-full rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Book now
        </button>
      </CardFooter>
    </Card>
  );
}

export { ProcedureCard };
