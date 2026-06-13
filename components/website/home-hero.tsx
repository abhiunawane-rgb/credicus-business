"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import RecruitmentHeroVisual from "@/components/illustrations/recruitment-hero";
import { AnimatedReveal } from "@/components/ui/animated-reveal";

export default function HomeHero() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className="space-y-6">
        <AnimatedReveal delay={0}>
          <span className="inline-flex items-center gap-2 rounded-full border border-credicus-yellow/30 bg-credicus-yellow/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-credicus-yellow">
            <Sparkles className="h-3.5 w-3.5 animate-pulse-glow" />
            Recruitment CRM + Growth Partner
          </span>
        </AnimatedReveal>
        <AnimatedReveal delay={100}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Build high-performing teams,{" "}
            <span className="bg-gradient-to-r from-credicus-yellow to-credicus-yellow-hover bg-clip-text text-transparent">
              faster than ever.
            </span>
          </h1>
        </AnimatedReveal>
        <AnimatedReveal delay={200}>
          <p className="text-lg text-credicus-gray-light">
            Credicus helps ambitious companies hire the right talent and streamline their full
            recruitment lifecycle with a modern CRM-led approach.
          </p>
        </AnimatedReveal>
        <AnimatedReveal delay={300}>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="ui-button-primary inline-flex items-center gap-2">
              Book a consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className="ui-button-secondary inline-flex items-center gap-2">
              Explore services
            </Link>
          </div>
        </AnimatedReveal>
      </div>
      <AnimatedReveal delay={200}>
        <div className="animate-float">
          <RecruitmentHeroVisual />
        </div>
      </AnimatedReveal>
    </div>
  );
}
