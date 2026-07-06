"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ActionDialog, { type ActionDialogState } from "@/components/ui/action-dialog";
import ActionToastStack, { type ToastItem } from "@/components/ui/action-toast-stack";
import type { ActionDialogVariant, NotifyVariant } from "@/lib/action-feedback-types";

export type { NotifyVariant };

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ActionDialogVariant;
};

export type PromptOptions = ConfirmOptions & {
  placeholder?: string;
  defaultValue?: string;
  inputType?: "text" | "password";
};

export type NotifyOptions = {
  title?: string;
  message: string;
  variant?: NotifyVariant;
  duration?: number;
};

type ActionFeedbackContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  notify: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    show: (options: NotifyOptions) => void;
  };
};

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(null);

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ActionFeedbackProvider({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<ActionDialogState | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const resolveRef = useRef<((value: boolean | string | null) => void) | null>(null);

  const closeDialog = useCallback((result: boolean | string | null) => {
    setDialogOpen(false);
    setDialogState(null);
    setPromptValue("");
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = (value) => resolve(Boolean(value));
      setDialogState({ type: "confirm", ...options });
      setDialogOpen(true);
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      resolveRef.current = (value) => resolve(typeof value === "string" ? value : null);
      setPromptValue(options.defaultValue ?? "");
      setDialogState({ type: "prompt", ...options });
      setDialogOpen(true);
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ title, message, variant = "info", duration = 4000 }: NotifyOptions) => {
      const id = createToastId();
      setToasts((prev) => [...prev, { id, title, message, variant }]);
      window.setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast],
  );

  const notify = useMemo(
    () => ({
      show,
      success: (message: string, title?: string) => show({ message, title, variant: "success" }),
      error: (message: string, title?: string) => show({ message, title, variant: "error", duration: 5000 }),
      info: (message: string, title?: string) => show({ message, title, variant: "info" }),
      warning: (message: string, title?: string) => show({ message, title, variant: "warning", duration: 4500 }),
    }),
    [show],
  );

  function handleDialogConfirm() {
    if (dialogState?.type === "prompt") {
      closeDialog(promptValue.trim());
      return;
    }
    closeDialog(true);
  }

  function handleDialogCancel() {
    closeDialog(dialogState?.type === "prompt" ? null : false);
  }

  const value = useMemo(() => ({ confirm, prompt, notify }), [confirm, prompt, notify]);

  return (
    <ActionFeedbackContext.Provider value={value}>
      {children}
      <ActionDialog
        open={dialogOpen}
        state={dialogState}
        promptValue={promptValue}
        onPromptValueChange={setPromptValue}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
      <ActionToastStack toasts={toasts} onDismiss={dismissToast} />
    </ActionFeedbackContext.Provider>
  );
}

export function useActionFeedback(): ActionFeedbackContextValue {
  const context = useContext(ActionFeedbackContext);
  if (!context) {
    throw new Error("useActionFeedback must be used within ActionFeedbackProvider");
  }
  return context;
}
