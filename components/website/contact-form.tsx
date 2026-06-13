"use client";

import { useState, type FormEvent } from "react";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { Field, FieldInput, FieldTextarea } from "@/components/ui/field";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (message.trim().length < 10) {
      setError("Please share a bit more detail — at least 10 characters — so we can help you properly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, message }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "We could not send your message. Please try again in a moment.");
        return;
      }

      setSuccess(payload.message ?? "Thanks — your message was sent. We will get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Something went wrong on our side. Please refresh the page and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="ui-card space-y-5 p-6" noValidate>
      <Field id="name" label="Full name" required hint="How should we address you in our reply?">
        <FieldInput
          id="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          invalid={Boolean(error) && !name.trim()}
        />
      </Field>

      <Field id="email" label="Email address" required hint="We will reply to this address.">
        <FieldInput
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          invalid={Boolean(error) && !email.trim()}
        />
      </Field>

      <Field
        id="message"
        label="How can we help?"
        required
        hint="Tell us about roles, timelines, or team size. Minimum 10 characters."
      >
        <FieldTextarea
          id="message"
          rows={4}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us about your hiring needs"
          invalid={Boolean(error) && message.trim().length < 10}
        />
      </Field>

      <Button type="submit" loading={isSubmitting} loadingLabel="Sending message...">
        Send inquiry
      </Button>

      {success ? (
        <Alert variant="success" title="Message sent" live="polite">
          {success}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="error" title="Could not send" live="assertive">
          {error}
        </Alert>
      ) : null}
    </form>
  );
}
