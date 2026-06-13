import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth-session";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }

  redirect(getRoleDashboardPath(session.role));
}
