"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionWrapper } from "./section-wrapper";

const faqs = [
  {
    question: "Нужен ли опыт работы с AI для использования платформы?",
    answer:
      "Нет, платформа разработана для косметологов без технических навыков. AI-консультант настраивается автоматически, а все инструменты имеют понятный интерфейс с подсказками.",
  },
  {
    question: "Можно ли импортировать базу клиентов из другой системы?",
    answer:
      "Да, поддерживается импорт из CSV, Excel, а также интеграция с популярными CRM через API. Процесс импорта занимает несколько минут, все данные сохраняются в безопасности.",
  },
  {
    question: "Как работает AI-консультант?",
    answer:
      "AI обучен на актуальной базе знаний по косметологии: процедуры, препараты, уход за кожей. Он отвечает клиентам в чате, рекомендует процедуры и помогает с выбором, работая 24/7.",
  },
  {
    question: "Есть ли бесплатный период?",
    answer:
      "Тариф Free доступен постоянно без ограничений по времени. Для полноценного использования рекомендуем Pro — первые 14 дней бесплатно, без привязки карты.",
  },
  {
    question: "Как обеспечивается безопасность данных?",
    answer:
      "Все данные шифруются при передаче (TLS) и хранении. Серверы расположены в сертифицированных дата-центрах. Регулярные бэкапы, контроль доступа и соответствие требованиям к персональным данным.",
  },
  {
    question: "Можно ли отменить подписку в любой момент?",
    answer:
      "Да, подписку можно отменить в один клик в настройках аккаунта. Доступ сохраняется до конца оплаченного периода, данные не удаляются.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
      >
        <span className="text-sm font-medium sm:text-base">{question}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <SectionWrapper>
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Частые вопросы
              </h2>
              <p className="mt-4 text-muted-foreground">
                Не нашли ответ? Напишите нам — мы поможем разобраться.
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper delay={150}>
            <div className="divide-y divide-border/60">
              {faqs.map((faq) => (
                <FaqItem key={faq.question} {...faq} />
              ))}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
