import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CosmAI — AI-платформа для косметологов",
  description:
    "Управляйте клиентами, записями и маркетингом с помощью искусственного интеллекта. CRM, AI-консультант, SMM-генератор, рассылки и аналитика.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
