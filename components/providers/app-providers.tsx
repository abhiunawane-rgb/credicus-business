"use client";

import type { ReactNode } from "react";
import { ActionFeedbackProvider } from "@/components/providers/action-feedback-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <ActionFeedbackProvider>{children}</ActionFeedbackProvider>;
}
