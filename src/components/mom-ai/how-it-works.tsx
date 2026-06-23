"use client";

import { MomSection } from "@/components/mom-ai/section-wrapper";
import { CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  return (
    <MomSection className="py-20 sm:py-28" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Wie Mom AI Assistant funktioniert
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Drei einfache Schritte zu mehr Leichtigkeit im Mamalltag.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "1. Starte dein Profil",
              desc: "Beantworte ein paar Fragen zu deiner Familie und deinen Zielen — die KI lernt dich und deinen Alltag kennen.",
            },
            {
              title: "2. Lass dich begleiten",
              desc: "Erhalte tägliche Pläne, Erinnerungen und Tipps — angepasst an deine aktuelle Situation und Stimmung.",
            },
            {
              title: "3. Entwickle dich weiter",
              desc: "Profitiere von der Community und Expertenwissen — für mehr Selbstvertrauen und Balance.",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 className="size-5 text-rose-600" />
                <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </MomSection>
  );
}
