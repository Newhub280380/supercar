import Link from "next/link";
import { Image, Send, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Возможности", href: "/#features" },
    { label: "Тарифы", href: "/pricing" },
    { label: "О платформе", href: "/about" },
    { label: "Контакты", href: "/contact" },
  ],
  resources: [
    { label: "Документация", href: "/about" },
    { label: "Блог", href: "/about" },
    { label: "Поддержка", href: "/contact" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                AI
              </div>
              <span className="font-heading text-lg font-semibold">CosmAI</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-платформа для косметологов. Автоматизируйте бизнес с помощью
              искусственного интеллекта.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Instagram"
              >
                <Image className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Telegram"
              >
                <Send className="size-4" />
              </a>
              <a
                href="mailto:hello@cosmai.ru"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Продукт</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Ресурсы</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>Москва, Россия</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>+7 (800) 123-45-67</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <a
                  href="mailto:hello@cosmai.ru"
                  className="transition-colors hover:text-foreground"
                >
                  hello@cosmai.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CosmAI. Все права защищены.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">
                Политика конфиденциальности
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
