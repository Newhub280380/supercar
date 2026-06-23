import Link from "next/link";
import { ArrowRight, Brain, Heart, Users, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MomHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 size-[500px] rounded-full bg-rose-500/8 blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 size-[400px] rounded-full bg-pink-500/10 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-violet-500/5 blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            <Sparkles className="size-3.5" />
            KI-Unterstützung für Mütter in Deutschland
          </div>

          <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-rose-600 dark:text-rose-400">Mom AI Assistant</span>
            <br />
            <span className="text-foreground">— dein Begleiter im Mamalltag</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Organisation, Selbstfürsorge und Community — alles, was Mütter in Deutschland
            brauchen, intelligent verbunden in einer App. Mit einer KI, die zuhört, versteht und unterstützt.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="#cta" className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-rose-600 hover:bg-rose-700 text-white")}>
              Kostenlos starten
              <ArrowRight className="size-4" />
            </Link>
            <Link href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Features entdecken
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Brain className="size-4 text-rose-500" />
              <span>KI-gestützte Alltagsplanung</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="size-4 text-rose-500" />
              <span>Individuelle Selbstfürsorge</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="size-4 text-rose-500" />
              <span>Community für Mütter</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
