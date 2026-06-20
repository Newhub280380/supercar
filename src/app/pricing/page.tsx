import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Pricing } from "@/components/landing/pricing";

export const metadata: Metadata = {
  title: "Тарифы — CosmAI",
  description:
    "Выберите подходящий тариф CosmAI. Бесплатный план, Pro для косметологов и Business для салонов. Прозрачные цены без скрытых платежей.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <Pricing />
        </section>
      </main>
      <Footer />
    </>
  );
}
