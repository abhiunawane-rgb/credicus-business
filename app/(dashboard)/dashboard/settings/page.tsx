import { redirect } from "next/navigation";
import { LogOut, Mail, Shield, User } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import IconBadge from "@/components/ui/icon-badge";
import { getAuthSession } from "@/lib/auth-session";

const roleLabels: Record<string, string> = {
  recruiter: "Recruiter",
  team_leader: "Team Leader",
  admin: "Administrator",
};

export default async function DashboardSettingsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <IconBadge icon={User} variant="light" size="lg" />
        <div>
          <h3 className="text-xl font-semibold text-credicus-ink sm:text-2xl">Settings</h3>
          <p className="text-credicus-gray">Manage your session and account context.</p>
        </div>
      </div>

      <div className="ui-card p-6">
        <div className="flex items-center gap-4 border-b border-credicus-line-default pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-credicus-primary-light text-xl font-bold text-credicus-primary">
            {session.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-credicus-ink">{session.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-credicus-primary/30 bg-credicus-primary-light px-2.5 py-0.5 text-xs font-medium text-credicus-primary">
              <Shield className="h-3 w-3" />
              {roleLabels[session.role] ?? session.role}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-credicus-line-default bg-credicus-surface px-4 py-3">
            <Mail className="h-4 w-4 text-credicus-gray" />
            <div>
              <p className="text-xs text-credicus-gray">Email</p>
              <p className="text-sm text-credicus-ink">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-credicus-line-default bg-credicus-surface px-4 py-3">
            <Shield className="h-4 w-4 text-credicus-gray" />
            <div>
              <p className="text-xs text-credicus-gray">Role</p>
              <p className="text-sm text-credicus-ink">{roleLabels[session.role] ?? session.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <LogOut className="h-4 w-4 text-credicus-gray" />
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
