"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 text-center ring-1 ring-border/40">
        <div className="flex size-14 items-center justify-center rounded-full bg-sage/20">
          <CheckCircle className="size-7 text-sage" />
        </div>
        <h3 className="font-heading text-xl font-semibold">
          Сообщение отправлено!
        </h3>
        <p className="text-sm text-muted-foreground">
          Мы получили ваше сообщение и ответим в течение 24 часов.
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="mt-2"
        >
          Отправить ещё
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl bg-card p-6 sm:p-8 ring-1 ring-border/40"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Имя
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ваше имя"
            className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="topic" className="text-sm font-medium">
          Тема
        </label>
        <select
          id="topic"
          name="topic"
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
        >
          <option value="general">Общий вопрос</option>
          <option value="demo">Запрос демо</option>
          <option value="partnership">Партнёрство</option>
          <option value="support">Техподдержка</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Расскажите, чем мы можем помочь..."
          className="flex min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="gap-2 self-end">
        <Send className="size-4" />
        {loading ? "Отправка..." : "Отправить"}
      </Button>
    </form>
  );
}
