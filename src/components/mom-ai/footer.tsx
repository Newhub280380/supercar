import Link from "next/link";

export function MomFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-bold">
              MA
            </div>
            <span className="font-heading text-sm font-semibold">Mom AI Assistant</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mom AI Assistant. Made with ❤️ in Germany.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">Impressum</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Datenschutz</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
