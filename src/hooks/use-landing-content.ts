"use client";

import { useState, useEffect, useCallback } from "react";
import type { LandingContent } from "@/lib/mom-ai/landing-generator";
import { generateLandingContent } from "@/lib/mom-ai/landing-generator";

export function useLandingContent() {
  const [data, setData] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLanding = useCallback(async () => {
    try {
      const res = await fetch("/api/convoy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "landing" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.landing) {
          setData(json.landing);
          return;
        }
      }
      const content = await generateLandingContent([], []);
      setData(content);
    } catch {
      const content = await generateLandingContent([], []);
      setData(content);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchLanding();
  }, [fetchLanding]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchLanding();
    });
  }, [fetchLanding]);

  return { data, loading, refresh };
}
