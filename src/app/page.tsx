import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeShowcase } from "@/components/theme-showcase";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
              AI
            </div>
            <span className="text-sm font-semibold">Cosmetology Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <ThemeShowcase />
      </main>
    </div>
  );
}
