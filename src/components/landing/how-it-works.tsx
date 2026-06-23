import {
  UserPlus,
  Settings,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const steps = [
  {
    icon: UserPlus,
    step: 1,
    title: "Регистрация",
    description: "Создайте аккаунт за 2 минуты. Выберите роль: косметолог или салон.",
  },
  {
    icon: Settings,
    step: 2,
    title: "Настройка",
    description: "Добавьте услуги, настройте расписание и импортируйте базу клиентов.",
  },
  {
    icon: MessageSquare,
    step: 3,
    title: "Запуск AI",
    description: "Активируйте AI-консультанта, настройте шаблоны рассылок и SMM.",
  },
  {
    icon: TrendingUp,
    step: 4,
    title: "Рост бизнеса",
    description: "Отслеживайте аналитику, получайте AI-рекомендации и масштабируйте.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Как это работает
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Четыре простых шага до автоматизации вашего косметологического бизнеса
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <SectionWrapper key={step.step} delay={i * 150}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/20">
                    <step.icon className="size-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
