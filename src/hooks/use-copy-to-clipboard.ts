"use client";

import { useCallback, useState } from "react";
import { copyToClipboard } from "@/lib/download";

/** Copies text and exposes which key was copied for the given timeout. */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key = text) => {
      await copyToClipboard(text);
      setCopiedKey(key);
      setTimeout(
        () => setCopiedKey((current) => (current === key ? null : current)),
        resetAfterMs,
      );
    },
    [resetAfterMs],
  );

  return { copy, copiedKey, isCopied: (key: string) => copiedKey === key };
}
