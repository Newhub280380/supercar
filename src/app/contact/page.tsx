import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Контакты — CosmAI",
  description:
    "Свяжитесь с командой CosmAI. Ответы на вопросы, демо-версия платформы, партнёрские предложения.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient-rose">Свяжитесь</span> с нами
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  Есть вопросы о платформе? Хотите получить демо? Напишите нам —
                  мы ответим в течение 24 часов.
                </p>
              </div>
            </SectionWrapper>

            <SectionWrapper delay={150}>
              <div className="mx-auto mt-12 max-w-xl">
                <ContactForm />
              </div>
            </SectionWrapper>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
