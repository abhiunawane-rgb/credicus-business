"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      router.replace("/sign-in");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoading}
      className="ui-button-ghost text-xs disabled:opacity-60 sm:text-sm"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
