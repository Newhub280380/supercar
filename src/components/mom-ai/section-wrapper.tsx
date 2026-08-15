"use client";

import { Reveal } from "@/components/ui/reveal";

interface MomSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function MomSection({ children, className, delay = 0, id }: MomSectionProps) {
  return (
    <Reveal as="section" id={id} className={className} delay={delay}>
      {children}
    </Reveal>
  );
}
