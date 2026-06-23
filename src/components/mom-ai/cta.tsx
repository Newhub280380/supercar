import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MomCta() {
  return (
    <section className="py-20 sm:py-28" id="cta">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-16 text-center text-white shadow-xl sm:px-12 sm:py-20">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Bereit für weniger Stress — und mehr du?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-rose-100">
            Starte jetzt kostenlos und entdecke, wie KI deinen Mamalltag entspannter machen kann.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#"
              className={buttonVariants({ size: "lg" })}
            >
              Jetzt kostenlos registrieren
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <span className="text-sm text-rose-100">Keine Kreditkarte erforderlich</span>
          </div>
        </div>
      </div>
    </section>
  );
}
