import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "./section-wrapper";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Идеально для начала работы",
    features: [
      "До 10 клиентов",
      "AI-консультант (50 сообщений/мес)",
      "Базовая аналитика",
      "1 пользователь",
      "Email-поддержка",
    ],
    cta: "Начать бесплатно",
    href: "/pricing",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "1 990",
    description: "Для практикующих косметологов",
    features: [
      "Неограниченные клиенты",
      "AI-консультант (без лимитов)",
      "CRM + календарь",
      "SMM-генератор",
      "Email-рассылки",
      "Расширенная аналитика",
      "Приоритетная поддержка",
    ],
    cta: "Выбрать Pro",
    href: "/pricing",
    highlighted: true,
  },
  {
    name: "Business",
    price: "4 990",
    description: "Для салонов и команд",
    features: [
      "Всё из Pro",
      "До 10 пользователей",
      "Роль администратора",
      "SEO-инструменты",
      "API-доступ",
      "Кастомные интеграции",
      "Персональный менеджер",
      "Обучение команды",
    ],
    cta: "Связаться с нами",
    href: "/contact",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Прозрачные тарифы
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Выберите план, который подходит вашему бизнесу. Масштабируйтесь по
              мере роста.
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <SectionWrapper key={plan.name} delay={i * 100}>
              <Card
                className={cn(
                  "relative flex h-full flex-col",
                  plan.highlighted
                    ? "border-primary/50 ring-2 ring-primary/20 shadow-lg"
                    : "border-border/40"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Sparkles className="size-3" />
                      Популярный
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="font-heading text-4xl font-bold">
                      ₽{plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-sm text-muted-foreground">
                        /мес
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-sage" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href={plan.href}
                    className={cn(
                      buttonVariants({
                        variant: plan.highlighted ? "default" : "outline",
                      }),
                      "w-full"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </CardFooter>
              </Card>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
