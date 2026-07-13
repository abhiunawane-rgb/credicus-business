import { redirect } from "next/navigation";
import TransferRequestsPanel from "@/components/candidates/transfer-requests-panel";
import { getAuthSession } from "@/lib/auth-session";

export default async function RecruiterTransfersPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.role !== "recruiter") redirect("/dashboard");

  return <TransferRequestsPanel />;
}
