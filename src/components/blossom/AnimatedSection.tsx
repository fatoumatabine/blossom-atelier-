import type { ReactNode, CSSProperties } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
  distance?: number;
}

export function AnimatedSection({
  children,
  className = "",
  direction = "up",
  delay = 0,
  distance = 36,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollReveal();

  const hidden: CSSProperties = {
    up: { opacity: 0, transform: `translateY(${distance}px)` },
    left: { opacity: 0, transform: `translateX(-${distance}px)` },
    right: { opacity: 0, transform: `translateX(${distance}px)` },
  }[direction];

  const shown: CSSProperties = { opacity: 1, transform: "none" };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(isVisible ? shown : hidden),
        transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
