import {
  Bot,
  Users,
  Share2,
  Mail,
  BarChart3,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionWrapper } from "./section-wrapper";

const features = [
  {
    icon: Bot,
    title: "AI-консультант",
    description:
      "Умный чат-бот отвечает на вопросы клиентов 24/7, рекомендует процедуры и помогает с выбором ухода.",
  },
  {
    icon: Users,
    title: "CRM система",
    description:
      "Полная база клиентов, история процедур, заметки, предпочтения и автоматические напоминания.",
  },
  {
    icon: Share2,
    title: "SMM-генератор",
    description:
      "AI создаёт посты для Instagram, Telegram и VK. Шаблоны акций, советы по уходу, сезонные предложения.",
  },
  {
    icon: Mail,
    title: "Рассылки",
    description:
      "Email и SMS-рассылки с персонализацией. Welcome-цепочки, напоминания, акции и предложения.",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description:
      "Дашборд с метриками: доход, LTV, конверсия, retention. AI-рекомендации для роста бизнеса.",
  },
  {
    icon: Search,
    title: "SEO-инструменты",
    description:
      "Оптимизация страницы, генерация мета-тегов, sitemap, аудит контента и отслеживание позиций.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Всё для вашего бизнеса
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Шесть мощных инструментов в одной платформе, объединённых силой
              искусственного интеллекта
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <SectionWrapper key={feature.title} delay={i * 100}>
              <Card className="h-full border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
