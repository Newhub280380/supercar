"use client";

import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

interface RevealProps extends React.ComponentProps<"div"> {
  as?: "div" | "section";
  delay?: number;
  threshold?: number;
}

/** Fades and slides its children in once they scroll into view. */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  threshold = 0.1,
  style,
  ...props
}: RevealProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>(threshold);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
