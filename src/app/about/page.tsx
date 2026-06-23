import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { Heart, Target, Users, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "О нас — CosmAI",
  description:
    "Узнайте больше о CosmAI — команде, которая создаёт AI-платформу для косметологов. Наша миссия, ценности и видение.",
};

const values = [
  {
    icon: Heart,
    title: "Забота о клиентах",
    description:
      "Мы ставим потребности косметологов и их клиентов в центр каждого решения. Каждый инструмент создан с заботой о реальном опыте.",
  },
  {
    icon: Target,
    title: "Фокус на результат",
    description:
      "Наши AI-инструменты нацелены на конкретные бизнес-результаты: рост базы клиентов, увеличение дохода и экономию времени.",
  },
  {
    icon: Users,
    title: "Сообщество",
    description:
      "Мы строим платформу вместе с косметологами. Обратная связь от пользователей определяет развитие каждой функции.",
  },
  {
    icon: Zap,
    title: "Инновации",
    description:
      "Мы используем передовые AI-технологии, адаптированные специально для косметологической индустрии и её специфики.",
  },
];

export default function AboutPage() {
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
                  <span className="text-gradient-rose">О платформе</span> CosmAI
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  CosmAI — это AI-платформа, созданная специально для
                  косметологов. Мы объединяем искусственный интеллект с глубоким
                  пониманием индустрии красоты, чтобы помочь вам автоматизировать
                  рутину и сосредоточиться на главном — клиентах.
                </p>
              </div>
            </SectionWrapper>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Наша миссия
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Сделать передовые AI-технологии доступными каждому косметологу —
                  от частного мастера до крупной клиники. Мы верим, что технологии
                  должны освобождать время, а не усложнять работу.
                </p>
              </div>
            </SectionWrapper>
          </div>
        </section>

        <section className="bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Наши ценности
                </h2>
              </div>
            </SectionWrapper>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {values.map((value, i) => (
                <SectionWrapper key={value.title} delay={i * 100}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <value.icon className="size-5" />
                      </div>
                      <CardTitle>{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </SectionWrapper>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
