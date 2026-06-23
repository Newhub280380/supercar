import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

export function MomNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/mom-ai" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-bold">
            MA
          </div>
          <span className="font-heading text-lg font-semibold">Mom AI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="#features" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Wie es funktioniert
          </Link>
          <Link href="#community" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Community
          </Link>
        </nav>
        <Link href="#cta" className={cn(buttonVariants({ size: "sm" }))}>
          Jetzt starten
        </Link>
      </div>
    </header>
  );
}
