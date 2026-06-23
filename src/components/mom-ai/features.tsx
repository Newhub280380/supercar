"use client";

import { FeatureGrid } from "@/components/mom-ai/feature-grid";
import { MomSection } from "@/components/mom-ai/section-wrapper";
import { useLandingContent } from "@/hooks/use-landing-content";

export function Features() {
  const { data, loading } = useLandingContent();

  if (loading) {
    return (
      <MomSection className="py-20 sm:py-28" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </MomSection>
    );
  }

  return (
    <MomSection className="py-20 sm:py-28 bg-muted/30" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Alles, was du brauchst — intelligent verbunden
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Von der Tagesplanung bis zur emotionalen Unterstützung — Mom AI Assistant begleitet dich durch den Mamalltag.
          </p>
        </div>
        <FeatureGrid features={data?.features ?? []} />
      </div>
    </MomSection>
  );
}
