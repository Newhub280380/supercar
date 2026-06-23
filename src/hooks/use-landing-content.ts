"use client";

import { useState, useEffect, useCallback } from "react";
import type { LandingContent } from "@/lib/mom-ai/landing-generator";
import { generateLandingContent } from "@/lib/mom-ai/landing-generator";

export function useLandingContent() {
  const [data, setData] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
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

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
