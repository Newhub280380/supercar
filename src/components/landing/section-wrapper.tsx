"use client";

import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionWrapper({ children, className, delay = 0 }: SectionWrapperProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
