import { MomNavbar } from "@/components/mom-ai/navbar";
import { MomHero } from "@/components/mom-ai/hero";
import { Features } from "@/components/mom-ai/features";
import { HowItWorks } from "@/components/mom-ai/how-it-works";
import { Testimonials } from "@/components/mom-ai/testimonials";
import { MomCta } from "@/components/mom-ai/cta";
import { MomFooter } from "@/components/mom-ai/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mom AI Assistant — KI Untertützung für Mütter in Deutschland",
  description:
    "KI-gestützte Alltagsorganisation, Selbstfürsorge und Community für Mütter in Deutschland. Jetzt kostenlos starten.",
  keywords: ["Mom AI", "Mutter", "KI", "Selbstfürsorge", "Alltag", "Deutschland", "Eltern"],
};

export default function MomAiPage() {
  return (
    <div className="min-h-screen bg-background">
      <MomNavbar />
      <main>
        <MomHero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <MomCta />
      </main>
      <MomFooter />
    </div>
  );
}
