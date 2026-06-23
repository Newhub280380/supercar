"use client";

import { MomSection } from "@/components/mom-ai/section-wrapper";
import { Quote } from "lucide-react";
import { useLandingContent } from "@/hooks/use-landing-content";

export function Testimonials() {
  const { data, loading } = useLandingContent();

  if (loading) {
    return (
      <MomSection className="py-20 sm:py-28 bg-muted/30" id="community">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </MomSection>
    );
  }

  return (
    <MomSection className="py-20 sm:py-28 bg-muted/30" id="community">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Was Mütter über uns sagen
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Erfahrungen aus der Community — ehrlich und inspirierend.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {data?.testimonials?.map((t, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Quote className="mb-4 size-6 text-rose-500" />
              <p className="text-sm leading-relaxed">{t.text}</p>
              <p className="mt-4 text-xs font-medium text-muted-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </MomSection>
  );
}
