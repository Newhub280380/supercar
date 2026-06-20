import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 size-[500px] rounded-full bg-primary/8 blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 size-[400px] rounded-full bg-accent/10 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 size-3" />
            Новая эра косметологии
          </Badge>

          <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-gradient-rose">AI-платформа</span>
            <br />
            <span className="text-foreground">для косметологов</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Управляйте клиентами, записями и маркетингом с помощью искусственного
            интеллекта. Всё в одном месте — от консультации до аналитики.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Попробовать бесплатно
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Узнать больше
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-sage" />
              <span>Бесплатный тариф</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-gold" />
              <span>Без привязки карты</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span>Настройка за 5 минут</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
