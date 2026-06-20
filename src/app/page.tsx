import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-4" />
          AI Cosmetology Platform
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Beauty meets{" "}
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Intelligence
          </span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          AI-powered platform for cosmetologists. Manage clients, appointments,
          consultations, and marketing — all in one place.
        </p>
        <div className="mt-4 flex gap-3">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}
