import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionWrapper } from "./section-wrapper";

const testimonials = [
  {
    name: "Анна Смирнова",
    role: "Косметолог, Москва",
    initials: "АС",
    rating: 5,
    text: "С CosmAI я перестала тратить часы на рассылки и посты. AI генерирует контент за минуты, а клиенты довольны скоростью ответа бота.",
  },
  {
    name: "Мария Козлова",
    role: "Владелица салона, СПб",
    initials: "МК",
    rating: 5,
    text: "CRM превзошла все ожидания. Команда из 5 человек работает синхронно, а аналитика помогает принимать верные решения каждый день.",
  },
  {
    name: "Елена Петрова",
    role: "Частный косметолог",
    initials: "ЕП",
    rating: 5,
    text: "Перешла с Excel и тетрадок — теперь всё в одном месте. AI-рекомендации по процедурам экономят мне и клиентам время на консультации.",
  },
  ];

const stats = [
  { value: "2 000+", label: "Косметологов" },
  { value: "150 000+", label: "Клиентов в базе" },
  { value: "99.9%", label: "Аптайм" },
  { value: "4.9/5", label: "Оценка" },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Нам доверяют
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Присоединяйтесь к тысячам косметологов, которые уже автоматизировали
              свой бизнес
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <SectionWrapper key={stat.label} delay={i * 75}>
              <div className="flex flex-col items-center rounded-2xl bg-card p-6 text-center ring-1 ring-border/40">
                <span className="font-heading text-3xl font-bold text-gradient-rose">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </SectionWrapper>
          ))}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <SectionWrapper key={t.name} delay={i * 100}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="size-4 fill-gold text-gold"
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
