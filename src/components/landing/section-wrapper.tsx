"use client";

import { Reveal } from "@/components/ui/reveal";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionWrapper({
  children,
  className,
  delay = 0,
}: SectionWrapperProps) {
  return (
    <Reveal className={className} delay={delay}>
      {children}
    </Reveal>
  );
}
