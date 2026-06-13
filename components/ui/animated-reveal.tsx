"use client";

import { Children, type ElementType, type ReactNode, useEffect, useRef, useState } from "react";

type AnimatedRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

export function AnimatedReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: AnimatedRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

type StaggerChildrenProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function StaggerChildren({ children, className = "", stagger = 90 }: StaggerChildrenProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <AnimatedReveal key={index} delay={index * stagger}>
          {child}
        </AnimatedReveal>
      ))}
    </div>
  );
}

export function PageEnter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`animate-fade-in-up ${className}`}>{children}</div>;
}
